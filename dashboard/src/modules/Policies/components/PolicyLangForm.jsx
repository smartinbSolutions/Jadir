import { useEffect, useState } from "react";
import { TextEditor } from "../../../components/TextEditor";

const PolicyLangForm = ({
  language,
  titleValue = "",
  summaryValue = "",
  contentValue = "",
  onLangChange,
}) => {
  const [localState, setLocalState] = useState({
    title: titleValue || "",
    summary: summaryValue || "",
    content: contentValue || "",
  });

  const isArabic = language === "ar";

  useEffect(() => {
    setLocalState({
      title: titleValue || "",
      summary: summaryValue || "",
      content: contentValue || "",
    });
  }, [titleValue, summaryValue, contentValue]);

  const handleChange = (key, value) => {
    setLocalState((prev) => ({
      ...prev,
      [key]: value,
    }));

    onLangChange?.(key, language, value);
  };

  return (
    <div className="card-table scrollable-x-auto pb-3">
      <table className="w-full table-auto text-sm text-gray-600">
        <tbody>
          <tr>
            <td className="p-2 pt-4">
              <div className="input-group">
                <span className="btn btn-input w-[20%] capitalize">
                  Title ({language.toUpperCase()})
                </span>

                <input
                  type="text"
                  className="input"
                  dir={isArabic ? "rtl" : "ltr"}
                  value={localState.title}
                  onChange={(event) =>
                    handleChange("title", event.target.value)
                  }
                  placeholder={`Enter title in ${language.toUpperCase()}`}
                />
              </div>
            </td>
          </tr>

          <tr>
            <td className="p-2 pt-4">
              <div className="input-group items-start">
                <span className="btn btn-input w-[20%] capitalize">
                  Summary ({language.toUpperCase()})
                </span>

                <textarea
                  value={localState.summary}
                  dir={isArabic ? "rtl" : "ltr"}
                  onChange={(event) =>
                    handleChange("summary", event.target.value)
                  }
                  placeholder={`Enter summary in ${language.toUpperCase()}`}
                  className="input min-h-[180px] w-full bg-white p-3 pb-[3rem] text-black tracking-[1px] leading-[20px]"
                />
              </div>
            </td>
          </tr>

          <tr>
            <td className="p-2 pt-4">
              <div className="input-group items-start">
                <span className="btn btn-input w-[20%] capitalize">
                  Content ({language.toUpperCase()})
                </span>

                <div className="w-[80%]">
                  <TextEditor
                    language={language}
                    value={localState.content}
                    onChange={(value) => handleChange("content", value)}
                    placeholder={`Enter content in ${language.toUpperCase()}`}
                    enableFontSize
                    enableColor
                    enableBackground
                    enableDirection
                    enableImage={false}
                    className="min-h-[240px] w-full bg-white text-black pb-[3rem]"
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PolicyLangForm;
