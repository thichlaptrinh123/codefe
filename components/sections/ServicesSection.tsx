import React from "react";
import BaseTitle from "@/components/shared/BaseTitle";
import BaseDescription from "@/components/shared/BaseDescription";
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import ServiceCard from "@/components/shared/Services/ServiceCard";
import ServiceList from "@/components/shared/Services/ServiceList";

export default function ServicesSection() {
  return (
    <section className="py-16 bg-background text-foreground">
      <MaxWidthWrapper>
        <BaseTitle>Our Services</BaseTitle>
        <BaseDescription className="text-center mt-[24px]">
          We offer a range of services to ensure the best care and comfort for our residents.
        </BaseDescription>

        {/* Các dịch vụ */}
        <div className="grid md:grid-cols-3 gap-[20px] mt-[36px]">
          <ServiceCard imageSrc="/images/icon-dau-cong.png" title="Care Services">
            <ServiceList items={[
              "Assistance with Daily Living (ADLs)",
              "Around the Clock Care",
              "Assistance with Medication",
              "Incidental Medical & Dental Needs",
              "Around the Clock Care",
              "Assistance with Medication"
            ]} />
          </ServiceCard>

          <ServiceCard imageSrc="/images/icon-ghe.png" title="Safety">
            <ServiceList items={[
              "Private & Shared Rooms",
              "Fully Furnished",
              "Wi-Fi & In-Room TV Connections",
              "Housekeeping & Laundry",
              "Technology Friendly",
              "Natural Light & Open Floor Plan Concept"
            ]} />
          </ServiceCard>

          <ServiceCard imageSrc="/images/icon-box-chat.png" title="Amenneties">
            <ServiceList items={[
              "24-Hours Awake Staff",
              "Trained & Compassionate Caregivers",
              "Doctor & Nurse On Call",
              "Wireless Call Buttons",
              "Fire Safety & Ongoing Training",
              "Safe & Desirable Neighborhood"
            ]} />
          </ServiceCard>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
