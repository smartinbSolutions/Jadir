import { useEffect, useState } from "react";
import { TextEditor } from "../../../components/TextEditor";

const BoardMemberLangForm = ({
  language,
  nameValue = "",
  positionValue = "",
  descriptionValue = "",
  onNameChange,
  onPositionChange,
  onDescriptionChange,
}) => {
  const isArabic = language === "ar";
  const textDirection = isArabic ? "rtl" : "ltr";

  const [localState, setLocalState] = useState({
    name: nameValue || "",
    position: positionValue || "",
    description: descriptionValue || "",
  });

  useEffect(() => {
    setLocalState({
      name: nameValue || "",
      position: positionValue || "",
      description: descriptionValue || "",
    });
  }, [nameValue, positionValue, descriptionValue]);

  const handleChange = (key, value) => {
    setLocalState((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "name") {
      onNameChange?.(language, value);
    }

    if (key === "position") {
      onPositionChange?.(language, value);
    }

    if (key === "description") {
      onDescriptionChange?.(language, value);
    }
  };

  const editorConfig = {
    placeholder: `Enter description in ${language.toUpperCase()}`,
    toolbar: {
      items: [
        "heading",
        "|",
        "bold",
        "italic",
        "link",
        "|",
        "bulletedList",
        "numberedList",
        "|",
        "outdent",
        "indent",
        "|",
        "blockQuote",
        "insertTable",
        "mediaEmbed",
        "|",
        "undo",
        "redo",
      ],
      shouldNotGroupWhenFull: true,
    },
    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1",
          view: "h2",
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: "h3",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: "h4",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
      ],
    },
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: "https://",
    },
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
  };

  const handleEditorReady = (editor) => {
    editor.editing.view.change((writer) => {
      writer.setAttribute(
        "dir",
        textDirection,
        editor.editing.view.document.getRoot(),
      );

      writer.setStyle(
        "text-align",
        isArabic ? "right" : "left",
        editor.editing.view.document.getRoot(),
      );
    });
  };

  return (
    <div className="space-y-6" dir={textDirection}>
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Board Member Content ({language.toUpperCase()})
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Add the localized name, position, and profile description.
          </p>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Name ({language.toUpperCase()})
            </label>

            <input
              type="text"
              className="input w-full"
              dir={textDirection}
              value={localState.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder={`Enter name in ${language.toUpperCase()}`}
            />
          </div>

          {/* Position */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Position ({language.toUpperCase()})
            </label>

            <input
              type="text"
              className="input w-full"
              dir={textDirection}
              value={localState.position}
              onChange={(event) => handleChange("position", event.target.value)}
              placeholder={`Enter position in ${language.toUpperCase()}`}
            />
          </div>

          {/* Description Editor */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Description ({language.toUpperCase()})
            </label>

            <div
              className={[
                "relative overflow-visible rounded-xl border border-gray-200 bg-white",
                "[&_.ck-editor]:overflow-visible",
                "[&_.ck-editor__top]:relative",
                "[&_.ck-editor__top]:z-20",
                "[&_.ck-toolbar]:overflow-visible",
                "[&_.ck-toolbar]:rounded-t-xl",
                "[&_.ck-toolbar]:border-0",
                "[&_.ck-toolbar]:border-b",
                "[&_.ck-toolbar]:border-gray-200",
                "[&_.ck-dropdown__panel]:z-50",
                "[&_.ck-editor__editable_inline]:min-h-[350px]",
                "[&_.ck-editor__editable_inline]:px-5",
                "[&_.ck-editor__editable_inline]:py-4",
                "[&_.ck-editor__main>.ck-editor__editable]:rounded-b-xl",
                "[&_.ck-editor__main>.ck-editor__editable]:border-0",
                "[&_.ck-editor__main>.ck-editor__editable.ck-focused]:border-0",
                "[&_.ck-editor__main>.ck-editor__editable.ck-focused]:shadow-none",
              ].join(" ")}
              dir={textDirection}
            >
              <TextEditor
                language={language}
                value={localState.description}
                onChange={(value) => handleChange("description", value)}
                placeholder={`Enter description in ${language.toUpperCase()}`}
                enableFontSize
                enableColor
                enableBackground
                enableDirection
                enableImage={false}
                className="bg-white text-black w-full"
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              You can use headings, links, lists, quotes, tables, and formatted
              text.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardMemberLangForm;
