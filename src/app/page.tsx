import CreateRoomForm from "./_components/CreateRoomForm";
import JoinRoomForm from "./_components/JoinRoomForm";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center max-sm:bg-white sm:bg-gradient-to-br sm:from-blue-500 sm:to-purple-600">
      <div className="flex w-full flex-col gap-4 rounded-lg bg-white p-4 sm:max-w-md sm:gap-8 sm:p-8 sm:shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Undercover
        </h1>

        <div className="rounded-lg bg-blue-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Créer une Salle
          </h2>
          <CreateRoomForm />
        </div>

        <div className="flex flex-col gap-4 rounded-lg bg-green-50 p-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Rejoindre une Salle
          </h2>
          <p>Demandez le lien de la salle ou entrez le code :</p>
          <JoinRoomForm />
        </div>
      </div>
    </div>
  );
}
