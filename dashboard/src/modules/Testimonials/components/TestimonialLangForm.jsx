import { useEffect, useState } from "react";

const TestimonialLangForm = ({
  language,
  nameValue = "",
  roleValue = "",
  companyValue = "",
  contentValue = "",
  onLangChange,
}) => {
  const [localState, setLocalState] = useState({
    name: nameValue || "",
    role: roleValue || "",
    company: companyValue || "",
    content: contentValue || "",
  });

  useEffect(() => {
    setLocalState({
      name: nameValue || "",
      role: roleValue || "",
      company: companyValue || "",
      content: contentValue || "",
    });
  }, [nameValue, roleValue, companyValue, contentValue]);

  const handleChange = (key, value) => {
    setLocalState((prev) => ({ ...prev, [key]: value }));
    onLangChange?.(key, language, value);
  };

  return (
    <div className="card-table scrollable-x-auto pb-3">
      <table className="table-auto w-full text-sm text-gray-600">
        <tbody>
          <tr>
            <td className="p-2 pt-4">
              <div className="input-group">
                <span className="btn btn-input w-[20%] capitalize">
                  Name ({language})
                </span>
                <input
                  type="text"
                  className="input"
                  value={localState.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
            </td>
          </tr>

          <tr>
            <td className="p-2 pt-4">
              <div className="input-group">
                <span className="btn btn-input w-[20%] capitalize">
                  Role ({language})
                </span>
                <input
                  type="text"
                  className="input"
                  value={localState.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                />
              </div>
            </td>
          </tr>

          <tr>
            <td className="p-2 pt-4">
              <div className="input-group">
                <span className="btn btn-input w-[20%] capitalize">
                  Company ({language})
                </span>
                <input
                  type="text"
                  className="input"
                  value={localState.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                />
              </div>
            </td>
          </tr>

          <tr>
            <td className="p-2 pt-4">
              <div className="input-group">
                <span className="btn btn-input w-[20%] capitalize">
                  Content ({language})
                </span>
                <textarea
                  value={localState.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  className="input min-h-[180px] w-full p-3 bg-white text-black min-h-[220px] w-full pb-[3rem] tracking-[1px] leading-[20px]"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TestimonialLangForm;
