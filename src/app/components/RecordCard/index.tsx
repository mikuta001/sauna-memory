import Image from "next/image";
import RecordCardHeader from "./RecordCardHeader";
import type { RecordCardProps } from "./type";
import Link from "next/link";

const RecordCard = ({
  title,
  rating,
  body,
  imageSrc,
  tagNames,
  href,
}: RecordCardProps) => {
  const hasImageSrc = imageSrc !== undefined && imageSrc.length > 0;
  const hasHref = !!href;

  return (
    <article className="flex flex-col gap-2 bg-[color:var(--white)] border border-gray-200 rounded-xs p-2 md:max-w-2xl">
      <RecordCardHeader title={title} rating={rating} />
      <p className="text-sm text-[var(--black)] my-2">{body}</p>

      {hasImageSrc &&
        imageSrc.map((src) => {
          return (
            <div
              key={src}
              className="relative w-full aspect-[2/3] md:aspect-[3/2]"
            >
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

      <div className="flex gap-2">
        <div className="flex justify-start gap-2 grow">
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
        {hasHref && <Link href={href} className="self-end text-sm border border-gray-300 rounded-md p-2 inline-flex. items-center justify-center bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">編集</Link>}
      </div>
    </article>
  );
};

export default RecordCard;
