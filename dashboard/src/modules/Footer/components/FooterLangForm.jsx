import { useEffect, useState } from "react";

const FooterLangForm = ({
  language,
  descriptionValue = "",
  onDescriptionChange,
  address = "",
  onAddressChange,
}) => {
  const [localValue, setLocalValue] = useState(descriptionValue || "");
  const [localAddress, setLocalAddress] = useState(address || "");

  useEffect(() => {
    setLocalValue(descriptionValue || "");
  }, [descriptionValue]);

  useEffect(() => {
    setLocalAddress(address || "");
  }, [address]);

  const handleChange = (field, value) => {
    if (field === "description") {
      setLocalValue(value);
      onDescriptionChange?.(language, value);
    }

    if (field === "address") {
      setLocalAddress(value);
      onAddressChange?.(language, value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Footer Description ({language.toUpperCase()})
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Write the short footer introduction for this language.
          </p>
        </div>

        <textarea
          value={localValue}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder={`Enter description in ${language.toUpperCase()}`}
          className="input min-h-[220px] w-full tracking-[1px] leading-[20px]"
          dir={language === "ar" ? "rtl" : "ltr"}
        />
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Footer Address ({language.toUpperCase()})
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Write the address to show in footer for this language.
          </p>
        </div>

        <textarea
          value={localAddress}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder={`Enter address in ${language.toUpperCase()}`}
          className="input min-h-[220px] w-full tracking-[1px] leading-[20px]"
          dir={language === "ar" ? "rtl" : "ltr"}
        />
      </div>
    </div>
  );
};

export default FooterLangForm;
