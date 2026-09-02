import { SaunaFriendDisplayProps } from "./type";

const SaunaFriendDisplay = ({ friend }: SaunaFriendDisplayProps) => {
  if (!friend) {
    return (
      <p className="animate-[visit-summary-rise_1200ms_ease-out] text-sm text-[rgba(85,85,85,0.75)]">
        この期間はひとりでサ活しました。
      </p>
    );
  }

  return (
    <section className="animate-[visit-summary-rise_1200ms_ease-out]">
      <p className="text-base text-[var(--black)]">
        <span className="text-2xl font-bold">{friend.name}</span>さん
      </p>
      <p className="mt-1 text-base text-[rgba(85,85,85,0.65)]">
        {friend.visitCount}回一緒に行きました
      </p>
    </section>
  );
};

export default SaunaFriendDisplay;
