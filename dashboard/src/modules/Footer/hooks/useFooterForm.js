import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useFooter from "../../hooks/useFooter";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const defaultWorkingSchedule = [
  {
    key: "sunday",
    day: {
      en: "Sunday",
      ar: "الأحد",
      tr: "Pazar",
    },
    order: 1,
  },
  {
    key: "monday",
    day: {
      en: "Monday",
      ar: "الاثنين",
      tr: "Pazartesi",
    },
    order: 2,
  },
  {
    key: "tuesday",
    day: {
      en: "Tuesday",
      ar: "الثلاثاء",
      tr: "Salı",
    },
    order: 3,
  },
  {
    key: "wednesday",
    day: {
      en: "Wednesday",
      ar: "الأربعاء",
      tr: "Çarşamba",
    },
    order: 4,
  },
  {
    key: "thursday",
    day: {
      en: "Thursday",
      ar: "الخميس",
      tr: "Perşembe",
    },
    order: 5,
  },
  {
    key: "friday",
    day: {
      en: "Friday",
      ar: "الجمعة",
      tr: "Cuma",
    },
    order: 6,
  },
  {
    key: "saturday",
    day: {
      en: "Saturday",
      ar: "السبت",
      tr: "Cumartesi",
    },
    order: 7,
  },
].map((item) => ({
  ...item,
  isClosed: false,
}));

const normalizeWorkingSchedule = (schedule = []) => {
  const source = Array.isArray(schedule) ? schedule : [];

  return defaultWorkingSchedule.map((defaultDay) => {
    const current = source.find((item) => item?.key === defaultDay.key) || {};

    return {
      key: defaultDay.key,

      day: {
        en: current?.day?.en || defaultDay.day.en,
        ar: current?.day?.ar || defaultDay.day.ar,
        tr: current?.day?.tr || defaultDay.day.tr,
      },

      isClosed: Boolean(current?.isClosed),

      // نعتمد ترتيبًا ثابتًا من الاثنين إلى الأحد.
      order: defaultDay.order,
    };
  });
};

const extractLegacyTimes = (footer = {}) => {
  const openDay = Array.isArray(footer?.workingSchedule)
    ? footer.workingSchedule.find(
        (day) => !day?.isClosed && (day?.startTime || day?.endTime),
      )
    : null;

  let startTime = footer?.workingStartTime || openDay?.startTime || "";
  let endTime = footer?.workingEndTime || openDay?.endTime || "";

  if ((!startTime || !endTime) && footer?.workingHours) {
    const parts = String(footer.workingHours)
      .split(/\s*-\s*/)
      .map((item) => item.trim());

    startTime = startTime || parts[0] || "";
    endTime = endTime || parts[1] || "";
  }

  return {
    startTime,
    endTime,
  };
};

const createEmptyLink = () => ({
  title: "",
  link: "",
});

const useFooterForm = () => {
  const { footer, isLoading, error, updateFooter, isUpdating } = useFooter();

  const [description, setDescription] = useState({
    ...emptyLangState,
  });

  const [address, setAddress] = useState({
    ...emptyLangState,
  });

  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [xTwitter, setXTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [workingStartTime, setWorkingStartTime] = useState("");
  const [workingEndTime, setWorkingEndTime] = useState("");

  const [workingSchedule, setWorkingSchedule] = useState(
    normalizeWorkingSchedule(),
  );

  const [links, setLinks] = useState([createEmptyLink()]);

  useEffect(() => {
    if (!footer) return;

    setDescription({
      en: footer?.description?.en || "",
      ar: footer?.description?.ar || "",
      tr: footer?.description?.tr || "",
    });

    setAddress({
      en: footer?.address?.en || "",
      ar: footer?.address?.ar || "",
      tr: footer?.address?.tr || "",
    });

    setFacebook(footer?.facebook || "");
    setInstagram(footer?.instagram || "");
    setXTwitter(footer?.xTwitter || "");
    setLinkedin(footer?.linkedin || "");
    setPhone(footer?.phone || "");
    setEmail(footer?.email || "");

    const times = extractLegacyTimes(footer);

    setWorkingStartTime(times.startTime);
    setWorkingEndTime(times.endTime);

    setWorkingSchedule(normalizeWorkingSchedule(footer?.workingSchedule));

    setLinks(
      footer?.links?.length
        ? footer.links.map((item) => ({
            title: item?.title || "",
            link: item?.link || "",
          }))
        : [createEmptyLink()],
    );
  }, [footer]);

  const handleDescriptionChange = (lang, value) => {
    setDescription((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleAddressChange = (lang, value) => {
    setAddress((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    setWorkingSchedule((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const handleScheduleClosedChange = (index, isClosed) => {
    setWorkingSchedule((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              isClosed,
            }
          : item,
      ),
    );
  };

  const addLink = () => {
    setLinks((prev) => [...prev, createEmptyLink()]);
  };

  const removeLink = (index) => {
    setLinks((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateLinkField = (index, field, value) => {
    setLinks((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const handleSave = async () => {
    try {
      const hasOpenDays = workingSchedule.some((day) => !day.isClosed);

      if (hasOpenDays && (!workingStartTime.trim() || !workingEndTime.trim())) {
        toast.error(
          "Start time and end time are required when there are open days",
        );

        return;
      }

      const normalizedSchedule = workingSchedule.map((item, index) => ({
        key: item.key,

        day: {
          en: item?.day?.en || "",
          ar: item?.day?.ar || "",
          tr: item?.day?.tr || "",
        },

        isClosed: Boolean(item.isClosed),
        order: index + 1,
      }));

      const payload = {
        description,
        address,

        links: links.filter((item) => item.title?.trim() && item.link?.trim()),

        facebook,
        instagram,
        xTwitter,
        linkedin,
        phone,
        email,

        workingStartTime: workingStartTime.trim(),
        workingEndTime: workingEndTime.trim(),

        workingSchedule: normalizedSchedule,
      };

      await updateFooter(payload).unwrap();

      toast.success("Footer updated successfully");
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to update footer");
    }
  };

  return {
    isLoading,
    error,
    isUpdating,

    description,
    handleDescriptionChange,

    address,
    handleAddressChange,

    facebook,
    setFacebook,

    instagram,
    setInstagram,

    xTwitter,
    setXTwitter,

    linkedin,
    setLinkedin,

    phone,
    setPhone,

    email,
    setEmail,

    workingStartTime,
    setWorkingStartTime,

    workingEndTime,
    setWorkingEndTime,

    workingSchedule,
    setWorkingSchedule,
    handleScheduleChange,
    handleScheduleClosedChange,

    links,
    addLink,
    removeLink,
    updateLinkField,

    handleSave,
  };
};

export default useFooterForm;
