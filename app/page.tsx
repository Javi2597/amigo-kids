import Tile from "@/components/Tile";
import Avatar from "@/components/Avatar";
import ProfilePicker from "@/components/ProfilePicker";
import StarsCounter from "@/components/StarsCounter";
import Suggestions from "@/components/Suggestions";
import KidsHub from "@/components/KidsHub";
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-5 py-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <Avatar mood="happy" size={150} />
        <h1 className="text-4xl font-bold text-ink">¡Hola amiguito!</h1>
        <p className="text-xl text-soft font-semibold">
          Soy Tino. ¿Qué quieres hacer hoy?
        </p>
        <div className="flex flex-col items-center gap-2">
          <ProfilePicker />
          <StarsCounter />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Tile href="/aprender" title="Aprender" emoji="🎨" color="coral" />
        <Tile href="/rutinas" title="Rutinas" emoji="📅" color="mint" />
        <Tile href="/hablar" title="Hablar con Tino" emoji="🗣️" color="sky" />
        <Tile href="/jugar" title="Jugar" emoji="🎈" color="lemon" />
        <Tile href="/historias" title="Historias" emoji="📖" color="lavender" />
      </div>

      <Suggestions />

      <KidsHub />

      <footer className="mt-auto flex justify-center pb-20">
        <Link
          href="/padres"
          className="rounded-full bg-surface px-4 py-2 text-sm font-bold text-soft shadow-soft"
        >
          👨‍👩‍👧 Para papás
        </Link>
      </footer>
    </main>
  );
}