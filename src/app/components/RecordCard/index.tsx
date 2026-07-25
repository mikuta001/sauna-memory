import Image from "next/image";
import RecordCardHeader from "./RecordCardHeader";
import type { RecordCardProps } from "./type";

const RecordCard = ({
  title,
  rating,
  body,
  imageSrc,
  tagNames,
}: RecordCardProps) => {
  const hasImageSrc = imageSrc !== undefined && imageSrc.length > 0;

  return (
    <article className="flex flex-col gap-2 bg-[color:var(--white)] border border-gray-100 rounded-xs shadow-md p-2 md:max-w-2xl">
      <RecordCardHeader title={title} rating={rating} />
      <p className="text-sm text-[var(--black)] my-2">{body}</p>

      {hasImageSrc &&
        imageSrc.map((src) => {
          return (
            <div key={src} className="relative w-full aspect-[2/3] md:aspect-[3/2]">
              <Image
                src={src}
                alt={`${title}の記録画像`}
                fill
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
          );
        })}

      <div className="flex justify-start gap-2">
        {tagNames.map((tagName: string) => {
          return (
            <p
              key={tagName}
              className="bg-indigo-400/75 rounded-full p-2 text-xs text-[var(--white)]"
            >
              # {tagName}
            </p>
          );
        })}
      </div>
    </article>
  );
};

export default RecordCard;
