"use client";

import { deleteVoiceMessage } from "@/app/andac/voice-actions";

export default function DeleteVoiceButton({ id }: { id: string }) {
  return (
    <form
      action={deleteVoiceMessage}
      onSubmit={(e) => {
        if (!confirm("Bu sesli mesajı silmek istediğine emin misin?")) {
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
