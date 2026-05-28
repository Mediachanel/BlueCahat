import { Card } from "@/components/ui/card";

export function StoryViewer() {
  return (
    <Card className="grid min-h-80 place-items-center bg-bluechat-navy p-6 text-center text-white">
      <div>
        <p className="text-sm text-blue-100">Story viewer</p>
        <h3 className="mt-2 text-2xl font-black">Pilih avatar story</h3>
        <p className="mt-2 text-sm text-blue-100">Viewer list dan mark-as-viewed tersedia lewat API story.</p>
      </div>
    </Card>
  );
}
