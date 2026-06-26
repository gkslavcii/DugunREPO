"use client";

import { deletePhoto } from "@/app/fotograflar/actions";

export default function DeletePhotoButton({ id }: { id: string }) {
  return (
    <form
      action={deletePhoto}
      onSubmit={(e) => {
        if (!confirm("Bu fotoğrafı silmek istediğine emin misin?")) {
          e.preventDefault();
        }
      }}
      className="absolute right-2 top-2 z-10"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm transition hover:bg-black/75"
      >
        Sil
      </button>
    </form>
  );
}
