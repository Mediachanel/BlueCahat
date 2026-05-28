import { MessageCircle } from "lucide-react";

export function EmptyConversation() {
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div>
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-bluechat-light text-bluechat-navy">
          <MessageCircle size={34} />
        </div>
        <h2 className="mt-4 text-xl font-black">Pilih percakapan</h2>
        <p className="mt-2 max-w-sm text-sm text-bluechat-muted">Pesan, lampiran, typing indicator, dan status baca akan tampil di sini.</p>
      </div>
    </div>
  );
}
