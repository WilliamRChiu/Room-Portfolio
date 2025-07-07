import React from "react";
import ProjectsCard from "../../Common/ProjectsCard/ProjectsCard";
import Projects from "../../Locales/Projects.json";
import styles from "./styles.module.scss";

export default function ProjectsModal() {
  const projectNames = Object.keys(Projects);

  return (
    <div className={styles.projectsContainer}>
      {projectNames.length > 0 &&
        projectNames.map((uniqueProject) => (
          <ProjectsCard
            key={uniqueProject}
            title={Projects[uniqueProject].title}
            codeUrl={Projects[uniqueProject].codeUrl}
            description={Projects[uniqueProject].description}
            tech={Projects[uniqueProject].tech}
          />
        ))}
    </div>
  );
}