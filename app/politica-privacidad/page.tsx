import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata = { title: "Política de privacidad · Amigo Kids" };

export default function PoliticaPrivacidad() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-2xl font-bold text-ink">Política de privacidad</h1>
        <div className="w-16" />
      </div>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-2 text-xl font-bold text-ink">1. ¿Qué hace Amigo Kids?</h2>
        <p className="text-base text-ink">
          Tino es un asistente de conversación para niños de 3 a 12 años. Acompaña
          momentos de <strong>juego y aprendizaje</strong> guiados por un adulto.
          Tino <strong>nunca reemplaza la supervisión</strong> ni el cuidado de un
          adulto.
        </p>
      </section>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-2 text-xl font-bold text-ink">2. Qué datos se procesan</h2>
        <ul className="list-inside list-disc space-y-2 text-base text-ink">
          <li>
            <strong>Texto del chat:</strong> se envía a un proveedor de IA para
            generar la respuesta y no se guarda en nuestros servidores.
          </li>
          <li>
            <strong>Voz (micrófono):</strong> solo se convierte a texto sobre la
            marcha para entender al niño. El audio <em>no se guarda</em>.
          </li>
          <li>
            <strong>Fotos:</strong> se analizan al instante para que Tino las
            describa y <em>no se guardan</em>. El consentimiento del adulto es
            obligatorio para usar la cámara.
          </li>
        </ul>
      </section>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-2 text-xl font-bold text-ink">3. Procesadores de datos</h2>
        <p className="mb-2 text-base text-ink">
          Las conversaciones se procesan por proveedores de inteligencia artificial
          para generar las respuestas y transcribir la voz. No compartimos datos con
          empresas de publicidad ni vendemos información.
        </p>
        <p className="text-base text-soft">
          Voz natural: si el adulto activa la "voz natural" en el panel de papás, el
          texto se envía a un servicio externo de texto-a-voz para generar el audio.
          Por defecto se usa la voz local del dispositivo, que no envía el texto a
          ningún servidor.
        </p>
      </section>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-2 text-xl font-bold text-ink">4. Retención y tu control</h2>
        <p className="mb-2 text-base text-ink">
          No guardamos conversaciones en el servidor. Si el adulto activa el
          <em> historial para revisión</em>, se guarda <strong>solo texto</strong>{" "}
          en el <strong>dispositivo</strong> de la familia (sin audio ni fotos) y se
          puede borrar en cualquier momento desde el panel de papás.
        </p>
        <p className="text-base text-ink">
          Como padre/madre podés revisar, borrar o desactivar el historial, los
          permisos de micrófono y de cámara en el panel de papás. Para otros
          derechos o consultas, usa el correo de contacto del equipo de Amigo Kids.
        </p>
      </section>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-2 text-xl font-bold text-ink">5. Menores y consentimiento</h2>
        <p className="text-base text-ink">
          Esta app está dirigida a menores de edad. En los países con leyes de
          protección (por ejemplo COPPA/EE. UU. o el GDPR europeo), pedimos el
          consentimiento de los padres, madres o tutores para procesar los datos de
          niños. En Argentina aplican la Ley 25.326 y la normativa de protección de
          datos de menores: no recopilamos datos personales de identificación más
          allá de un nombre de pila opcional que elegís vos.
        </p>
        <p className="mt-2 text-base text-soft">
          Tino siempre dice que los temas delicados o de miedo se compartan también
          con un adulto de confianza, y cuenta con medidas de separación del
          contenido inapropiado, además de un bloqueo automático ante varias alertas
          de riesgo (que solo puede quitar un adulto).
        </p>
      </section>

      <section className="rounded-4xl bg-lemon/25 p-5">
        <h2 className="mb-2 text-lg font-bold text-ink">Contacto</h2>
        <p className="text-base text-ink">
          Para dudas sobre privacidad o para eliminar datos, escribinos por el
          canal del proyecto (GitHub) o el correo indicado en el panel de papás.
        </p>
        <p className="mt-2 text-sm text-soft">
          Última actualización: 8 de agosto de 2026.
        </p>
      </section>

      <Link href="/padres" className="text-center text-sm font-bold text-mascot underline">
        Volver al panel de papás
      </Link>
    </main>
  );
}