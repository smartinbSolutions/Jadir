/* eslint-disable react/prop-types */

import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./TextEditor.css";

const DEFAULT_CLASS_NAME = "bg-white text-black min-h-[180px] w-full pb-[3rem]";

const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "22px",
  "24px",
  "28px",
  "32px",
  "36px",
  "40px",
  "48px",
];

// Make Quill use inline font-size styles such as font-size: 18px
const SizeStyle = Quill.import("attributors/style/size");

SizeStyle.whitelist = FONT_SIZES;

Quill.register(SizeStyle, true);

export const TextEditor = ({
  value = "",
  onChange,
  className,
  classes,
  placeholder,
  enableImage = true,
  enableColor = true,
  enableBackground = false,
  enableDirection = false,
  enableFontSize = true,
  language,
  dir,
  modules,
  formats,
  ...props
}) => {
  const isRtl = dir === "rtl" || language === "ar";

  const editorClassName = [
    "text-editor",
    className || classes || DEFAULT_CLASS_NAME,
    isRtl ? "rtl-editor" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const toolbar = [[{ header: [1, 2, 3, 4, false] }]];

  if (enableFontSize) {
    toolbar.push([{ size: FONT_SIZES }]);
  }

  toolbar.push(
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
  );

  if (enableDirection) {
    toolbar.push([{ direction: "rtl" }]);
  }

  if (enableColor || enableBackground) {
    const colorControls = [];

    if (enableColor) {
      colorControls.push({ color: [] });
    }

    if (enableBackground) {
      colorControls.push({ background: [] });
    }

    toolbar.push(colorControls);
  }

  const mediaControls = ["link"];

  if (enableImage) {
    mediaControls.push("image");
  }

  toolbar.push(mediaControls, ["blockquote", "code-block"], ["clean"]);

  const defaultModules = {
    toolbar: {
      container: toolbar,
    },

    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },

    clipboard: {
      matchVisual: false,
    },
  };

  const defaultFormats = [
    "header",
    ...(enableFontSize ? ["size"] : []),
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "blockquote",
    "code-block",
    ...(enableImage ? ["image"] : []),
    ...(enableColor ? ["color"] : []),
    ...(enableBackground ? ["background"] : []),
    ...(enableDirection ? ["direction"] : []),
  ];

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-editor-wrapper" dir="ltr">
        <ReactQuill
          theme="snow"
          modules={modules || defaultModules}
          formats={formats || defaultFormats}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className={editorClassName}
          {...props}
        />
      </div>
    </div>
  );
};
