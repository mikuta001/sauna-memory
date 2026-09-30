-- 手動レビュー後に適用する。既存の全ユーザーに仮 UUID を割り当てる。
-- auth.users との対応付け・外部キー追加は、認証導入時の別マイグレーションで行う。
-- 適用前に書き込みを停止し、バックアップと復元方法を確認すること。
BEGIN;

SET LOCAL lock_timeout = '10s';
LOCK TABLE "Users", "Visits", "Companions" IN ACCESS EXCLUSIVE MODE;

-- 旧 ID が別ユーザーに使われていた場合、開発ユーザーとして移行しない。
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "Users"
        WHERE "id" = -1 AND "email" <> 'sauna-memory-dev@example.invalid'
    ) THEN
        RAISE EXCEPTION 'Users.id = -1 does not belong to the development user';
    END IF;
END;
$$;

CREATE TEMP TABLE "_users_uuid_map" (
    "old_id" INTEGER PRIMARY KEY,
    "new_id" UUID NOT NULL UNIQUE
) ON COMMIT DROP;

INSERT INTO "_users_uuid_map" ("old_id", "new_id")
SELECT "id", CASE
    WHEN "id" = -1 THEN '9b291e42-c86a-4f3d-b972-21e687a93d05'::UUID
    ELSE gen_random_uuid()
END
FROM "Users";

-- 変換後も、同じ投稿・同行者が同じユーザーに紐付くことを検証する。
CREATE TEMP TABLE "_visits_uuid_expected" ON COMMIT DROP AS
SELECT v."id", m."new_id" AS "user_id"
FROM "Visits" v LEFT JOIN "_users_uuid_map" m ON m."old_id" = v."user_id";

CREATE TEMP TABLE "_companions_uuid_expected" ON COMMIT DROP AS
SELECT c."id", m."new_id" AS "user_id"
FROM "Companions" c LEFT JOIN "_users_uuid_map" m ON m."old_id" = c."user_id";

-- ALTER COLUMN の USING から同じ対応表を参照する一時関数。
CREATE FUNCTION pg_temp.user_uuid_for_migration(old_id INTEGER)
RETURNS UUID LANGUAGE SQL STABLE STRICT AS $$
    SELECT "new_id" FROM pg_temp."_users_uuid_map" WHERE "old_id" = $1
$$;

ALTER TABLE "Visits" DROP CONSTRAINT "Visits_user_id_fkey";
ALTER TABLE "Companions" DROP CONSTRAINT "Companions_user_id_fkey";

-- 列を削除せず型変換する。主キー・NOT NULL とその他の列の値を保持する。
ALTER TABLE "Users" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "Users" ALTER COLUMN "id" TYPE UUID
    USING pg_temp.user_uuid_for_migration("id");
ALTER TABLE "Visits" ALTER COLUMN "user_id" TYPE UUID
    USING pg_temp.user_uuid_for_migration("user_id");
ALTER TABLE "Companions" ALTER COLUMN "user_id" TYPE UUID
    USING pg_temp.user_uuid_for_migration("user_id");

DROP SEQUENCE "Users_id_seq";

ALTER TABLE "Visits" ADD CONSTRAINT "Visits_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Companions" ADD CONSTRAINT "Companions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DO $$
BEGIN
    IF (SELECT count(*) FROM "Users") <> (SELECT count(*) FROM "_users_uuid_map")
        OR EXISTS (
            SELECT 1 FROM "_users_uuid_map" m
            LEFT JOIN "Users" u ON u."id" = m."new_id"
            WHERE u."id" IS NULL
        )
        OR EXISTS (
            SELECT 1 FROM "_visits_uuid_expected" e
            FULL JOIN "Visits" v ON v."id" = e."id"
            WHERE e."id" IS NULL OR v."id" IS NULL
                OR v."user_id" IS DISTINCT FROM e."user_id"
        )
        OR EXISTS (
            SELECT 1 FROM "_companions_uuid_expected" e
            FULL JOIN "Companions" c ON c."id" = e."id"
            WHERE e."id" IS NULL OR c."id" IS NULL
                OR c."user_id" IS DISTINCT FROM e."user_id"
        )
    THEN
        RAISE EXCEPTION 'User UUID migration changed row counts or user relationships';
    END IF;
END;
$$;

DROP FUNCTION pg_temp.user_uuid_for_migration(INTEGER);

COMMIT;
