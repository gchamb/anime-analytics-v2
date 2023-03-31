type ChipProps = {
  text: string;
};

export default function Chip({ text }: ChipProps) {
  return (
    <div className="bg-aa-1 dark:bg-aa-dark-1 rounded-full text-sm p-2 dark:text-aa-3">
      <span>{text}</span>
    </div>
  );
}
