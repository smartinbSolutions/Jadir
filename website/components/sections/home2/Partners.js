"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import getImageUrl from "@/components/utils/getImageUrl";

export default function Partners({ partners = [] }) {
  const { t, i18n } = useTranslation();

  const language = i18n.language || "en";

  return (
    <section className="clients-style-two" style={{ marginTop: "100px" }}>
      <div className="auto-container">
        <div className="sec-title centred">
          <span className="sub-title">{t("partners.title")}</span>

          <h2>{t("partners.subtitle")}</h2>
        </div>

        <div className="inner-container">
          <ul
            className="clients-list clearfix d-flex"
            style={{
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            {partners.map((partner, index) => {
              const partnerTitle =
                partner?.title?.[language] ||
                partner?.title?.en ||
                partner?.title?.ar ||
                partner?.title?.tr ||
                "";

              const partnerImage = getImageUrl(partner?.imageUrl);

              log;

              return (
                <li
                  className="shadow-sm rounded-5"
                  key={partner?._id || partner?.id || index}
                >
                  {partnerTitle ? (
                    <h4 className="mb-2">{partnerTitle}</h4>
                  ) : null}

                  <figure className="clients-logo">
                    <Link
                      href="#"
                      style={{
                        cursor: "default",
                      }}
                      onClick={(event) => event.preventDefault()}
                      aria-label={partnerTitle}
                    >
                      {partnerImage ? (
                        <img
                          style={{
                            width: "250px",
                            height: "200px",
                            objectFit: "contain",
                          }}
                          src={partnerImage}
                          alt={partnerTitle}
                        />
                      ) : (
                        <div
                          style={{
                            width: "250px",
                            height: "200px",
                          }}
                          className="d-flex align-items-center justify-content-center bg-light text-muted"
                        >
                          No image
                        </div>
                      )}
                    </Link>
                  </figure>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
