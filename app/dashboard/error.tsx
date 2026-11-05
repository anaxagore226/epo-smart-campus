"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icon";

export default function DashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center p-5 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fff0ec] text-[#d95f42]">
          <Icon name="alert" />
        </div>
        <p className="mt-4 font-bold">Impossible d’afficher cette page</p>
        <p className="mt-1 text-xs text-subtle">Les données du campus n’ont pas pu être chargées.</p>
        <button
          type="button"
          onClick={retry}
          className="mt-5 rounded-xl bg-forest-800 px-5 py-3 text-xs font-bold text-white"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
