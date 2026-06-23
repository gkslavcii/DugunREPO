"use client";

import { deleteNoteAction } from "@/app/admin/actions";

export default function DeleteNoteButton({ id }: { id: string }) {
  return (
    <form
      action={deleteNoteAction}
      onSubmit={(e) => {
        if (!confirm("Bu notu silmek istediğine emin misin?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-ink-soft/60 transition hover:text-[#b56a60]"
      >
        Sil
      </button>
    </form>
  );
}
