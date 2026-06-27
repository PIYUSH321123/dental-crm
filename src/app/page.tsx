
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      Admin links :
      <Link href="/admin/dashboard">Dashboard</Link>
      <br />
      Dummy Company URL "Dynamic"
      <Link href="/c/Phyiso/dashboard">Phyiso</Link>
    </div>
  );
}
