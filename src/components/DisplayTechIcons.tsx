import { getTechLogos } from "@/lib/utils";
import Image from "next/image";

export default async function DisplayTechIcons({ techStack }: TechIconProps) {
  const TechLogos = await getTechLogos(techStack);

  return (
    <>
      <div className="flex flex-row gap-1">
        {TechLogos.slice(0, 3).map(({ tech, url }) => {
          return (
            <div
              key={tech}
              className="relative group bg-dark-300 rounded-full p-2 flex-center"
            >
              <span className="tech-tooltip">{tech}</span>
              <Image
                src={url}
                alt={tech}
                width={50}
                height={50}
                className="size-5"
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
