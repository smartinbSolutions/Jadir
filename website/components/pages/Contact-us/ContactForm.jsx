"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetContactInfoQuery,
  useSendMessageMutation,
} from "@/RTK/Api/Contact/ContactApi";

// import "../../../../dashboard/src/components/keenicons/assets/duotone/style.css";
import { useGetPublicServicesQuery } from "@/RTK/Api/Services/ServicesApi";
import SearchableSelect from "@/components/elements/SearchableSelect";
import LoadingCard from "@/components/utils/LoadingCard";
import { FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
const requestTypeOptions = [
  { value: "investment-inquiry", label: "consultInquiry" },
  { value: "partnership", label: "partnership" },
  { value: "media", label: "media" },
  { value: "support", label: "support" },
  { value: "request-service", label: "serviceRequest" },
  { value: "complaint", label: "complaint" },
];

const localize = (value, lang) =>
  value?.[lang] || value?.en || value?.ar || value?.tr || "";

const ContactForm = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    requestType: "investment-inquiry",
    service: "",
    message: "",
  });

  const [submitState, setSubmitState] = useState({
    type: "",
    message: "",
  });

  const {
    data: response,
    isLoading: isLoadingContact,
    isError: isContactError,
    refetch,
  } = useGetContactInfoQuery();

  const [sendMessage, { isLoading: isSubmitting }] = useSendMessageMutation();
  const [showSuccess, setShowSuccess] = useState(false);
  const isServiceRequest = formData.requestType === "request-service";
  const {
    data: servicesResponse,
    isLoading: isLoadingServices,
    isError: isServicesError,
  } = useGetPublicServicesQuery(undefined, {
    skip: !isServiceRequest,
  });

  const contact = response?.data || {};

  const branches = useMemo(
    () =>
      Array.isArray(contact?.branches)
        ? [...contact.branches]
            .filter((item) => item?.isActive !== false)
            .sort((a, b) => (a?.order || 0) - (b?.order || 0))
        : [],
    [contact?.branches]
  );

  const serviceOptions = useMemo(
    () =>
      Array.isArray(servicesResponse?.data)
        ? [...servicesResponse.data].sort(
            (a, b) => (a?.order || 0) - (b?.order || 0)
          )
        : [],
    [servicesResponse?.data]
  );

  const getServiceLabel = (service) =>
    localize(service?.title, lang) || service?.slug || "";

  const handleChange = (field) => (e) => {
    setFormData((current) => ({
      ...current,
      [field]: e.target.value,
    }));
  };

  const handleRequestTypeChange = (e) => {
    const nextRequestType = e.target.value;

    setFormData((current) => ({
      ...current,
      requestType: nextRequestType,
      service: nextRequestType === "request-service" ? current.service : "",
    }));
  };

  const handleServiceChange = (service) => {
    setFormData((current) => ({
      ...current,
      service: service?._id || service?.id || "",
    }));
  };

  const clearForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      requestType: "investment-inquiry",
      service: "",
      message: "",
    });
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
    setSubmitState({
      type: "",
      message: "",
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return t("enter_name");
    if (!formData.email.trim()) return t("enter_email");
    if (isServiceRequest && !formData.service) return t("select_service");
    if (!formData.message.trim()) return t("enter_msg");
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setSubmitState({
        type: "error",
        message: validationError,
      });
      return;
    }

    try {
      const result = await sendMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        requestType: isServiceRequest
          ? "service-request"
          : formData.requestType,
        service: isServiceRequest ? formData.service : null,
        message: formData.message.trim(),
      }).unwrap();

      setShowSuccess(true);
      setSubmitState({
        type: "success",
        message: result?.message || t("send_success"),
      });
      clearForm();
    } catch (error) {
      setSubmitState({
        type: "error",
        message: error?.data?.message || error?.error || t("send_failed"),
      });
    }
  };

  if (isLoadingContact) return <LoadingCard />;

  if (isContactError) {
    return (
      <section className="jadwa-contact-v2">
        <div className="auto-container">
          <div className="jadwa-contact-v2-error">
            <h3>{t("failed_load_data")}</h3>
            <p>{t("try_again")}</p>
            <button
              type="button"
              className="jadwa-contact-v2-submit"
              onClick={() => refetch()}
            >
              {t("retry")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="jadwa-contact-v2">
      <div className="auto-container">
        <div className="jadwa-contact-v2-shell">
          <span className="jadwa-contact-v2-glow jadwa-contact-v2-glow--one" />
          <span className="jadwa-contact-v2-glow jadwa-contact-v2-glow--two" />
          <span className="jadwa-contact-v2-glow jadwa-contact-v2-glow--three" />

          <div className="jadwa-contact-v2-panel">
            <div className="jadwa-contact-v2-info">
              <div className="jadwa-contact-v2-info-inner">
                <div className="jadwa-pill jadwa-contact-v2-pill-dark">
                  <span className="jadwa-pill-dot" />
                  <span style={{ color: "#fff" }}>{t("contact.title")}</span>
                </div>

                <h2 className="jadwa-contact-v2-title">
                  {t("contact_form_title")}
                </h2>

                <p className="jadwa-contact-v2-text">
                  {t("contact.description2")}
                </p>

                <div className="jadwa-contact-v2-list">
                  {contact?.address ? (
                    <div className="jadwa-contact-v2-item">
                      <div className="jadwa-contact-v2-item-icon">
                        <i className="fa-solid fa-location-dot" />
                      </div>
                      <div className="jadwa-contact-v2-item-body">
                        <h4>{t("address")}</h4>
                        <p>{localize(contact.address, lang)}</p>
                        {contact?.mapLink ? (
                          <a
                            href={contact.mapLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t("open_map")}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {Array.isArray(contact?.emails) &&
                  contact.emails.filter(Boolean).length > 0 ? (
                    <div className="jadwa-contact-v2-item">
                      <div className="jadwa-contact-v2-item-icon">
                        <i className="fa-solid fa-envelope" />
                      </div>
                      <div className="jadwa-contact-v2-item-body">
                        <h4>{t("contact.email")}</h4>
                        {contact.emails.filter(Boolean).map((item) => (
                          <p key={item}>
                            <a href={`mailto:${item}`}>{item}</a>
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {Array.isArray(contact?.phones) &&
                  contact.phones.filter(Boolean).length > 0 ? (
                    <div className="jadwa-contact-v2-item">
                      <div className="jadwa-contact-v2-item-icon">
                        <i className="fa-solid fa-phone" />
                      </div>
                      <div className="jadwa-contact-v2-item-body">
                        <h4>{t("contact.phone")}</h4>
                        {contact.phones.filter(Boolean).map((item) => (
                          <p key={item}>
                            <a
                              href={`tel:${item.replace(/\s+/g, "")}`}
                              dir="ltr"
                            >
                              {item}
                            </a>
                          </p>
                        ))}
                        {contact?.whatsapp ? (
                          <p className="jadwa-contact-v2-whatsapp-row">
                            <a
                              href={`https://wa.me/${contact.whatsapp.replace(
                                /[^\d]/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="jadwa-contact-v2-whatsapp-link"
                              aria-label="WhatsApp"
                            >
                              <span
                                className="jadwa-contact-v2-whatsapp-icon"
                                aria-hidden="true"
                              >
                                <FaWhatsapp />
                              </span>

                              <span
                                className="jadwa-contact-v2-whatsapp-number"
                                dir="ltr"
                              >
                                {contact.whatsapp}
                              </span>
                            </a>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="jadwa-contact-v2-form-side">
              <div className="jadwa-contact-v2-form-card">
                <div className="jadwa-pill jadwa-contact-v2-pill-light">
                  <span className="jadwa-pill-dot" />
                  <span>
                    {t("contact.formTitle") === "contact.formTitle"
                      ? "Send Message"
                      : t("contact.formTitle")}
                  </span>
                </div>

                <h3 className="jadwa-contact-v2-form-title">
                  {t("contact.formTitle")}
                </h3>

                <form
                  autoComplete="off"
                  onSubmit={submit}
                  className="jadwa-contact-v2-form"
                >
                  <div className="jadwa-contact-v2-fields">
                    <div className="jadwa-contact-v2-field">
                      <label>
                        {t("contact.name")}{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange("name")}
                        placeholder={t("contact.name")}
                        required
                      />
                    </div>

                    <div className="jadwa-contact-v2-field">
                      <label>
                        {t("contact.email")}{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange("email")}
                        placeholder={t("contact.email")}
                        required
                      />
                    </div>

                    <div className="jadwa-contact-v2-field">
                      <label>{t("contact.phone")}</label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange("phone")}
                        placeholder={t("contact.phone")}
                      />
                    </div>

                    <div className="jadwa-contact-v2-field">
                      <label>{t("subject")}</label>
                      <input
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange("subject")}
                        placeholder={t("subject")}
                      />
                    </div>

                    <div className="jadwa-contact-v2-field jadwa-contact-v2-field-full">
                      <label>{t("request_type")}</label>
                      <select
                        name="requestType"
                        value={formData.requestType}
                        onChange={handleRequestTypeChange}
                      >
                        {requestTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.label)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {isServiceRequest ? (
                      <div className="jadwa-contact-v2-field jadwa-contact-v2-field-full">
                        <label>
                          {t("service")} <span className="text-danger">*</span>
                        </label>
                        <SearchableSelect
                          className="jadwa-contact-v2-searchable"
                          inputClassName="jadwa-contact-v2-searchable-input"
                          menuClassName="jadwa-contact-v2-searchable-menu"
                          optionClassName="jadwa-contact-v2-searchable-option"
                          labelWidth={0}
                          height="3.25"
                          placeholder={
                            isLoadingServices
                              ? t("loading")
                              : isServicesError
                              ? t("failed_load_data")
                              : t("search.button")
                          }
                          options={{ data: serviceOptions }}
                          selectedValue={formData.service}
                          onChange={handleServiceChange}
                          disabled={isLoadingServices || isServicesError}
                          error={isServiceRequest && !formData.service}
                          getOptionLabel={getServiceLabel}
                        />
                        {isServicesError ? (
                          <span className="jadwa-contact-v2-field-note">
                            {t("failed_load_data")}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="jadwa-contact-v2-field jadwa-contact-v2-field-full">
                      <label>
                        {t("contact.message")}{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange("message")}
                        placeholder={t("contact.message")}
                        required
                      />
                    </div>
                  </div>

                  {submitState.type === "error" && submitState.message ? (
                    <div className="jadwa-contact-v2-error-message">
                      {submitState.message}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    className="jadwa-contact-v2-submit"
                    disabled={isSubmitting}
                  >
                    <span>
                      {isSubmitting ? t("loading") : t("contact.submit")}
                    </span>

                    <i
                      className={
                        isSubmitting
                          ? "fa-solid fa-spinner fa-spin"
                          : i18n.language?.startsWith("ar")
                          ? "fa-solid fa-arrow-left"
                          : "fa-solid fa-arrow-right"
                      }
                      aria-hidden="true"
                    />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        {branches.length ? (
          <div className="jadwa-contact-v2-branches-section">
            <div className="jadwa-testimonials-head jadwa-contact-v2-branches-head">
              <div className="jadwa-pill">
                <span className="jadwa-pill-dot" />
                <span>{t("branches_badge")}</span>
              </div>

              <h2 className="jadwa-testimonials-title">
                {t("branches_title")}
              </h2>

              <p className="jadwa-testimonials-subtitle">
                {t("branches_sub_title")}
              </p>
            </div>

            <div className="row clearfix">
              {branches.map((branch) => (
                <div
                  className="col-lg-4 col-md-6 col-sm-12 mb-4"
                  key={branch?._id}
                >
                  <div className="jadwa-contact-v2-branch-card">
                    <div className="jadwa-contact-v2-branch-card-top">
                      <div className="jadwa-contact-v2-branch-icon">
                        <i className="fa-solid fa-building" />
                      </div>

                      <div>
                        <h4>{localize(branch?.name, lang)}</h4>
                        <p>{localize(branch?.address, lang)}</p>
                      </div>
                    </div>

                    {branch?.phones?.[0] ? (
                      <a
                        className="jadwa-contact-v2-branch-phone"
                        href={`tel:${branch.phones[0].replace(/\s+/g, "")}`}
                        dir="ltr"
                      >
                        {branch.phones[0]}
                      </a>
                    ) : null}

                    <div className="jadwa-contact-v2-branch-card-links">
                      {branch?.mapLink ? (
                        <a
                          href={branch.mapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="jadwa-contact-v2-branch-link"
                        >
                          <FaMapMarkerAlt aria-hidden="true" />
                          <span>{t("map")}</span>
                        </a>
                      ) : null}

                      {branch?.whatsapp ? (
                        <a
                          href={`https://wa.me/${branch.whatsapp.replace(
                            /[^\d]/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="jadwa-contact-v2-branch-link"
                        >
                          <FaWhatsapp aria-hidden="true" />
                          <span>{t("whatsapp")}</span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {showSuccess ? (
        <div
          className="jadwa-contact-v2-success-overlay"
          onClick={closeSuccessModal}
        >
          <div
            className="jadwa-contact-v2-success-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="jadwa-contact-v2-success-close"
              onClick={closeSuccessModal}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <div className="jadwa-contact-v2-success-icon">
              <i className="fa-solid fa-check" />
            </div>

            <h3>{t("msg_received_title")}</h3>

            <p>{t("msg_received_txt")}</p>

            <button
              type="button"
              onClick={closeSuccessModal}
              className="jadwa-contact-v2-submit"
            >
              {t("continue")}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ContactForm;
