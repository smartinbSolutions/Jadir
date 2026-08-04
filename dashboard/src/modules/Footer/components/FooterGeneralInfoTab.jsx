const MetricCard = ({ icon, label, value, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-50 text-emerald-600",
    danger: "bg-red-50 text-red-600",
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          colorClasses[color] || colorClasses.primary
        }`}
      >
        <i className={`${icon} text-lg`}></i>
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>

        <p className="mt-0.5 truncate text-base font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
};

const SectionHeader = ({ icon, title, description, action }) => (
  <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      {icon ? (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <i className={`${icon} text-lg`}></i>
        </div>
      ) : null}

      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>

        {description ? (
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        ) : null}
      </div>
    </div>

    {action}
  </div>
);

const CompactField = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  disabled = false,
  dir,
}) => (
  <div className="min-w-0">
    <label className="mb-1.5 block text-xs font-medium text-gray-500">
      {label}
    </label>

    <input
      type={type}
      className={`input w-full ${
        disabled ? "cursor-not-allowed bg-gray-100 text-gray-400" : ""
      }`}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      dir={dir}
    />
  </div>
);

const WorkingScheduleEditor = ({
  schedule = [],
  setSchedule,
  workingStartTime,
  setWorkingStartTime,
  workingEndTime,
  setWorkingEndTime,
}) => {
  const updateDayLanguage = (index, language, value) => {
    setSchedule((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index
          ? {
              ...item,
              day: {
                ...(item.day || {}),
                [language]: value,
              },
            }
          : item,
      ),
    );
  };

  const updateClosed = (index, isClosed) => {
    setSchedule((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index
          ? {
              ...item,
              isClosed,
            }
          : item,
      ),
    );
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <SectionHeader
        icon="ki-outline ki-calendar"
        title="Working Days & Hours"
        description="Set one working time range and choose which days are closed."
      />

      <div className="border-b border-gray-100 bg-gray-50/60 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <CompactField
            label="Working start time"
            type="time"
            value={workingStartTime}
            onChange={(event) => setWorkingStartTime(event.target.value)}
          />

          <CompactField
            label="Working end time"
            type="time"
            value={workingEndTime}
            onChange={(event) => setWorkingEndTime(event.target.value)}
          />
        </div>

        <p className="mt-3 text-xs text-gray-500">
          This time range will be used for every open working day.
        </p>
      </div>

      <div className="hidden border-b border-gray-100 bg-gray-50/80 px-5 py-3 xl:grid xl:grid-cols-[1fr_1fr_1fr_100px] xl:gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          English
        </span>

        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Arabic
        </span>

        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Turkish
        </span>

        <span className="text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
          Closed
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {schedule.map((day, index) => (
          <div
            key={day.key || index}
            className={`px-5 py-4 transition-colors ${
              day.isClosed ? "bg-red-50/40" : "hover:bg-gray-50/60"
            }`}
          >
            <div className="mb-3 flex items-center justify-between xl:hidden">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {day?.day?.en || `Day ${index + 1}`}
                </span>
              </div>

              {day.isClosed ? (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
                  Closed
                </span>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_100px] xl:items-end">
              <CompactField
                label="English"
                value={day?.day?.en}
                onChange={(event) =>
                  updateDayLanguage(index, "en", event.target.value)
                }
                placeholder="Monday"
              />

              <CompactField
                label="Arabic"
                value={day?.day?.ar}
                onChange={(event) =>
                  updateDayLanguage(index, "ar", event.target.value)
                }
                placeholder="الاثنين"
                dir="rtl"
              />

              <CompactField
                label="Turkish"
                value={day?.day?.tr}
                onChange={(event) =>
                  updateDayLanguage(index, "tr", event.target.value)
                }
                placeholder="Pazartesi"
              />

              <label className="flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={Boolean(day.isClosed)}
                  onChange={(event) =>
                    updateClosed(index, event.target.checked)
                  }
                />

                <span className="xl:hidden">Closed</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const QuickLinksEditor = ({
  links = [],
  addLink,
  removeLink,
  updateLinkField,
}) => (
  <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
    <SectionHeader
      icon="ki-outline ki-link"
      title="Quick Links"
      description="Manage the footer navigation links."
      action={
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={addLink}
        >
          <i className="ki-outline ki-plus"></i>
          Add Link
        </button>
      }
    />

    <div className="hidden border-b border-gray-100 bg-gray-50/80 px-5 py-3 md:grid md:grid-cols-[1fr_1.5fr_40px] md:gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Title
      </span>

      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        URL
      </span>

      <span />
    </div>

    <div className="divide-y divide-gray-100">
      {links.map((item, index) => (
        <div
          key={index}
          className="grid gap-3 px-5 py-4 transition-colors hover:bg-gray-50/60 md:grid-cols-[1fr_1.5fr_40px] md:items-end"
        >
          <CompactField
            label="Title"
            value={item.title}
            onChange={(event) =>
              updateLinkField(index, "title", event.target.value)
            }
            placeholder="About us"
          />

          <CompactField
            label="URL"
            value={item.link}
            onChange={(event) =>
              updateLinkField(index, "link", event.target.value)
            }
            placeholder="/about"
          />

          <button
            type="button"
            className="flex h-[42px] w-full items-center justify-center rounded-xl border border-red-200 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300 md:w-10"
            onClick={() => removeLink(index)}
            disabled={links.length === 1}
            title="Remove link"
          >
            <i className="ki-outline ki-trash text-lg"></i>

            <span className="ml-2 md:hidden">Remove</span>
          </button>
        </div>
      ))}
    </div>
  </section>
);

const FooterGeneralInfoTab = ({
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

  workingSchedule = [],
  setWorkingSchedule,

  links = [],
  addLink,
  removeLink,
  updateLinkField,
}) => {
  const configuredDays = workingSchedule.filter(
    (day) => day?.day?.en || day?.day?.ar || day?.day?.tr,
  ).length;

  const openDays = workingSchedule.filter((day) => !day?.isClosed).length;

  const closedDays = workingSchedule.filter((day) => day?.isClosed).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          icon="ki-outline ki-calendar-tick"
          label="Configured Days"
          value={`${configuredDays} / ${workingSchedule.length || 7}`}
        />

        <MetricCard
          icon="ki-outline ki-time"
          label="Open Days"
          value={openDays}
          color="success"
        />

        <MetricCard
          icon="ki-outline ki-calendar-remove"
          label="Closed Days"
          value={closedDays}
          color="danger"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <SectionHeader
            icon="ki-outline ki-address-book"
            title="Contact Details"
            description="Main contact information displayed in the footer."
          />

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <CompactField
              label="Phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter phone number"
            />

            <CompactField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter footer email"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <SectionHeader
            icon="ki-outline ki-share"
            title="Social Media"
            description="Social channels displayed in the footer."
          />

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <CompactField
              label="Facebook"
              value={facebook}
              onChange={(event) => setFacebook(event.target.value)}
              placeholder="Facebook URL"
            />

            <CompactField
              label="Instagram"
              value={instagram}
              onChange={(event) => setInstagram(event.target.value)}
              placeholder="Instagram URL"
            />

            <CompactField
              label="X / Twitter"
              value={xTwitter}
              onChange={(event) => setXTwitter(event.target.value)}
              placeholder="X or Twitter URL"
            />

            <CompactField
              label="LinkedIn"
              value={linkedin}
              onChange={(event) => setLinkedin(event.target.value)}
              placeholder="LinkedIn URL"
            />
          </div>
        </section>
      </div>

      <WorkingScheduleEditor
        schedule={workingSchedule}
        setSchedule={setWorkingSchedule}
        workingStartTime={workingStartTime}
        setWorkingStartTime={setWorkingStartTime}
        workingEndTime={workingEndTime}
        setWorkingEndTime={setWorkingEndTime}
      />

      <QuickLinksEditor
        links={links}
        addLink={addLink}
        removeLink={removeLink}
        updateLinkField={updateLinkField}
      />
    </div>
  );
};

export default FooterGeneralInfoTab;
