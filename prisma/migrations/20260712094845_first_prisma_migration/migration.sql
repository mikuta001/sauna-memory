-- CreateTable
CREATE TABLE "Visits" (
    "id" SERIAL NOT NULL,
    "sauna_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment" VARCHAR(140) NOT NULL,
    "review_rating" DECIMAL(65,30) NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saunas" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "image_path" VARCHAR(1000) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Saunas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Companions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Companions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit_companions" (
    "id" SERIAL NOT NULL,
    "visit_id" INTEGER NOT NULL,
    "companion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_companions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit_images" (
    "id" SERIAL NOT NULL,
    "visit_id" INTEGER NOT NULL,
    "image_path" VARCHAR(1000) NOT NULL,
    "seq_no" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Visits" ADD CONSTRAINT "Visits_sauna_id_fkey" FOREIGN KEY ("sauna_id") REFERENCES "Saunas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visits" ADD CONSTRAINT "Visits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Companions" ADD CONSTRAINT "Companions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit_companions" ADD CONSTRAINT "Visit_companions_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "Visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit_companions" ADD CONSTRAINT "Visit_companions_companion_id_fkey" FOREIGN KEY ("companion_id") REFERENCES "Companions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit_images" ADD CONSTRAINT "Visit_images_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "Visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
