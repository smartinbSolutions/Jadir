import { useEffect, useState } from "react";
import { TextEditor } from "../../../../components/TextEditor";

const BlogLangForm = ({ language, value = {}, onChange }) => {
  const isArabic = language === "ar";

  const [localValue, setLocalValue] = useState({
    title: value?.title || "",
    excerpt: value?.excerpt || "",
    authorName: value?.authorName || "",
    authorRole: value?.authorRole || "",
    content: value?.content || "",
  });

  useEffect(() => {
    setLocalValue({
      title: value?.title || "",
      excerpt: value?.excerpt || "",
      authorName: value?.authorName || "",
      authorRole: value?.authorRole || "",
      content: value?.content || "",
    });
  }, [
    value?.title,
    value?.excerpt,
    value?.authorName,
    value?.authorRole,
    value?.content,
  ]);

  const handleChange = (key, newValue) => {
    setLocalValue((prev) => {
      const updated = {
        ...prev,
        [key]: newValue,
      };

      onChange?.(language, updated);

      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Article Content ({language.toUpperCase()})
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Fill in the localized title, excerpt, author information, and full
            article content.
          </p>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Title ({language.toUpperCase()})
            </label>

            <input
              name="title"
              type="text"
              dir={isArabic ? "rtl" : "ltr"}
              value={localValue.title}
              onChange={(event) => handleChange("title", event.target.value)}
              placeholder={`Enter title in ${language.toUpperCase()}`}
              className="input"
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Excerpt ({language.toUpperCase()})
            </label>

            <div className="w-full bg-white">
              <TextEditor
                language={language}
                value={localValue.excerpt}
                onChange={(newValue) => handleChange("excerpt", newValue)}
                placeholder={`Enter excerpt in ${language.toUpperCase()}`}
                enableDirection
                enableImage={false}
                className="w-full bg-white text-black"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900">
                Author Information
              </h4>

              <p className="mt-1 text-xs text-gray-500">
                Enter the localized author name and role.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Author Name ({language.toUpperCase()})
                </label>

                <input
                  name="authorName"
                  type="text"
                  dir={isArabic ? "rtl" : "ltr"}
                  value={localValue.authorName}
                  onChange={(event) =>
                    handleChange("authorName", event.target.value)
                  }
                  placeholder={`Enter author name in ${language.toUpperCase()}`}
                  className="input"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Author Role ({language.toUpperCase()})
                </label>

                <input
                  name="authorRole"
                  type="text"
                  dir={isArabic ? "rtl" : "ltr"}
                  value={localValue.authorRole}
                  onChange={(event) =>
                    handleChange("authorRole", event.target.value)
                  }
                  placeholder={`Enter author role in ${language.toUpperCase()}`}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Content ({language.toUpperCase()})
            </label>

            <div className="w-full bg-white">
              <TextEditor
                language={language}
                value={localValue.content}
                onChange={(newValue) => handleChange("content", newValue)}
                placeholder={`Enter content in ${language.toUpperCase()}`}
                enableFontSize
                enableColor
                enableBackground
                enableDirection
                enableImage={false}
                className="w-full bg-white text-black"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogLangForm;
