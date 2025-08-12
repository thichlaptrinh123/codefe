// app/admin/components/shared/CKEditorClient.tsx
import dynamic from "next/dynamic";
import React from "react";


interface Props {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Dynamic import CKEditor only on client-side to avoid `window is not defined` during SSR.
 * We return a wrapper component that renders the CKEditor when loaded.
 */
const CKEditorNoSSR = dynamic(
  async () => {
    const mod = await import("@ckeditor/ckeditor5-react");
    const ClassicEditorMod = await import("@ckeditor/ckeditor5-build-classic");
    const CKEditor = mod.CKEditor;
    const ClassicEditor = (ClassicEditorMod && (ClassicEditorMod as any).default) || ClassicEditorMod;

    // Return a React component that forwards props to CKEditor
    return function CKEditorWrapper(props: any) {
      return <CKEditor editor={ClassicEditor} {...props} />;
    };
  },
  { ssr: false }
);

export default function CKEditorClient({ value, onChange }: Props) {
  return (
    <div className="ckeditor-wrapper">
      {/* 
        CKEditorNoSSR sẽ chỉ mount trên client. 
        Nếu TypeScript complain về prop types, bạn có thể cast props thành any hoặc define đúng type interface cho onChange etc.
      */}
 
 <CKEditorNoSSR
  data={value}
  onChange={(_: any, editor: any) => {
    const html = editor.getData();
    onChange(html); // Giữ nguyên HTML
  }}
/>

    </div>
  );
}
