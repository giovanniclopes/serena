export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
  correctedValue?: string;
}

export function validateDate(dateString: string): ValidationResult {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: "Data inválida",
        suggestion: "Verifique se a data está no formato correto (YYYY-MM-DD)",
      };
    }

    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

    if (date < tenYearsAgo) {
      return {
        isValid: false,
        error: "Data muito antiga",
        suggestion: "A data não pode ser anterior a 10 anos atrás",
      };
    }

    const tenYearsFromNow = new Date();
    tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);

    if (date > tenYearsFromNow) {
      return {
        isValid: false,
        error: "Data muito futura",
        suggestion: "A data não pode ser posterior a 10 anos no futuro",
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: "Erro ao processar data",
      suggestion: "Tente usar um formato de data válido",
    };
  }
}

export function validateTime(timeString: string): ValidationResult {
  try {
    const cleanTime = timeString.trim().toLowerCase();

    const timePatterns = [
      /^(\d{1,2}):(\d{2})$/,
      /^(\d{3,4})$/,
    ];

    let hours: number | undefined;
    let minutes: number | undefined;

    for (const pattern of timePatterns) {
      const match = cleanTime.match(pattern);
      if (match) {
        if (pattern.source.includes(":")) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
        } else {
          const timeStr = match[1];
          if (timeStr.length === 3) {
            hours = parseInt(timeStr[0], 10);
            minutes = parseInt(timeStr.slice(1), 10);
          } else {
            hours = parseInt(timeStr.slice(0, 2), 10);
            minutes = parseInt(timeStr.slice(2), 10);
          }
        }
        break;
      }
    }

    if (hours === undefined || minutes === undefined) {
      return {
        isValid: false,
        error: "Formato de horário inválido",
        suggestion: "Use formatos como: 14:30, 2:30, 1430 ou 230",
      };
    }

    if (hours < 0 || hours > 23) {
      return {
        isValid: false,
        error: "Hora inválida",
        suggestion: `A hora deve estar entre 00 e 23. Você digitou: ${hours}`,
        correctedValue: hours > 23 ? "23" : "00",
      };
    }

    if (minutes < 0 || minutes > 59) {
      return {
        isValid: false,
        error: "Minutos inválidos",
        suggestion: `Os minutos devem estar entre 00 e 59. Você digitou: ${minutes}`,
        correctedValue: minutes > 59 ? "59" : "00",
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: "Erro ao processar horário",
      suggestion: "Tente usar um formato de horário válido",
    };
  }
}

export function validateProject(
  projectName: string,
  availableProjects: Array<{ id: string; name: string }>
): ValidationResult {
  if (!projectName || !availableProjects) {
    return { isValid: true };
  }

  const normalizedSearchName = projectName.toLowerCase().trim();

  const exactMatch = availableProjects.find(
    (p) => p.name.toLowerCase().trim() === normalizedSearchName
  );

  if (exactMatch) {
    return { isValid: true };
  }

  const projectWords = normalizedSearchName
    .split(/\s+/)
    .filter(
      (word) =>
        ![
          "de",
          "da",
          "do",
          "das",
          "dos",
          "em",
          "na",
          "no",
          "nas",
          "nos",
        ].includes(word)
    );

  const partialMatches = availableProjects.filter((p) => {
    const projectNameWords = p.name
      .toLowerCase()
      .split(/\s+/)
      .filter(
        (word) =>
          ![
            "de",
            "da",
            "do",
            "das",
            "dos",
            "em",
            "na",
            "no",
            "nas",
            "nos",
          ].includes(word)
      );

    return projectWords.every((searchWord) =>
      projectNameWords.some(
        (projectWord) =>
          projectWord.includes(searchWord) || searchWord.includes(projectWord)
      )
    );
  });

  if (partialMatches.length > 0) {
    return {
      isValid: true,
      suggestion: `Projeto encontrado: "${partialMatches[0].name}"`,
    };
  }

  const similarProjects = availableProjects.filter((p) => {
    const projectNameLower = p.name.toLowerCase();
    return (
      projectNameLower.includes(normalizedSearchName) ||
      normalizedSearchName.includes(projectNameLower)
    );
  });

  if (similarProjects.length > 0) {
    return {
      isValid: false,
      error: "Projeto não encontrado",
      suggestion: `Projetos similares disponíveis: ${similarProjects
        .map((p) => `"${p.name}"`)
        .join(", ")}`,
    };
  }

  return {
    isValid: false,
    error: "Projeto não encontrado",
    suggestion:
      "O projeto especificado não existe. A tarefa será criada sem projeto.",
  };
}

export function validateDateTime(dateTimeString: string): ValidationResult {
  try {
    const dateTime = new Date(dateTimeString);

    if (isNaN(dateTime.getTime())) {
      return {
        isValid: false,
        error: "Data e horário inválidos",
        suggestion: "Use o formato ISO 8601: YYYY-MM-DDTHH:MM:SS",
      };
    }

    const year = dateTime.getFullYear();
    const month = dateTime.getMonth() + 1;
    const day = dateTime.getDate();
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    const reconstructedDate = new Date(year, month - 1, day, hours, minutes);
    if (
      reconstructedDate.getDate() !== day ||
      reconstructedDate.getMonth() !== month - 1 ||
      reconstructedDate.getFullYear() !== year
    ) {
      return {
        isValid: false,
        error: "Data impossível",
        suggestion: `A data ${day}/${month}/${year} não existe no calendário`,
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: "Erro ao processar data e horário",
      suggestion: "Verifique o formato da data e horário",
    };
  }
}

export function validateTaskData(taskData: {
  title: string;
  dueDate?: string;
  projectName?: string;
  availableProjects?: Array<{ id: string; name: string }>;
}): {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
  correctedData?: {
    title: string;
    dueDate?: string;
    projectName?: string;
  };
} {
  const errors: string[] = [];
  const suggestions: string[] = [];
  const correctedData = { ...taskData };

  if (!taskData.title || taskData.title.trim().length === 0) {
    errors.push("Título é obrigatório");
  }

  if (taskData.dueDate) {
    const dateValidation = validateDateTime(taskData.dueDate);
    if (!dateValidation.isValid) {
      errors.push(dateValidation.error || "Data inválida");
      if (dateValidation.suggestion) {
        suggestions.push(dateValidation.suggestion);
      }
    }
  }

  if (taskData.projectName && taskData.availableProjects) {
    const projectValidation = validateProject(
      taskData.projectName,
      taskData.availableProjects
    );
    if (!projectValidation.isValid) {
      errors.push(projectValidation.error || "Projeto inválido");
      if (projectValidation.suggestion) {
        suggestions.push(projectValidation.suggestion);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
    correctedData: errors.length === 0 ? correctedData : undefined,
  };
}
