import Image from "next/image";

interface AvatarPreviewProps {
  previewUrl: string;
}

export function AvatarPreview({ previewUrl }: AvatarPreviewProps) {
  return (
    <div className="text-center">
      <h3 className="mb-2 text-lg font-semibold">Preview</h3>
      <div className="flex gap-3">
        <Image
          src={previewUrl}
          alt="Square preview"
          width={96}
          height={96}
          className="border-border border"
        />
        <Image
          src={previewUrl}
          alt="Round preview"
          width={96}
          height={96}
          className="border-border rounded-full border"
        />
      </div>
    </div>
  );
}

