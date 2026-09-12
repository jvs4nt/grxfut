import { cardClass } from "@/lib/ui";

export default function AppLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className={`${cardClass} h-36 animate-pulse`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${cardClass} h-48 animate-pulse`} />
        <div className={`${cardClass} h-48 animate-pulse`} />
      </div>
    </div>
  );
}
