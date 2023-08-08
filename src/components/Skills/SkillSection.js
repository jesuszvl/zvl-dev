import React from "react";
import styles from "./Skills.module.scss";
import Image from "next/image";

const SkillSection = ({ title, images }) => {
  return (
    <div className={styles["section-container"]} key={title}>
      <span className={styles["section-title"]}>{title}</span>
      <div className={styles["techstack"]}>
        {images.map((image) => {
          return (
            <div key={image.name} className={styles["techstack-skill"]}>
              <Image
                src={image.src}
                height={32}
                alt={image.name}
                title={image.name}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillSection;