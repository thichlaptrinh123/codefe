import Image from "next/image";

interface ServiceListProps {
  items: string[];
}

export default function ServiceList({ items }: ServiceListProps) {
  return (
    <ul className="text-left space-y-3">
      {items.map((text, index) => (
        <li key={index} className="flex items-center gap-[10px]">
          <Image
            src="/images/check-icon.png"
            alt="check"
            width={20}
            height={20}
          />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
