// Test-split samples from KazFakeCorpus (external_validation_set.json)

export type Label = "REAL" | "FAKE";

export interface Example {
  id: string;
  chip: string;
  language: "Kazakh" | "Russian";
  label: Label;
  source: string;
  text: string;
}

export const EXAMPLES: Example[] = [
  {
    id: "kz-real",
    chip: "Kazakh · REAL",
    language: "Kazakh",
    label: "REAL",
    source: "kazinform.kz",
    text: "Қазақстан азаматтарына Вьетнамда білім алу үшін үш грант бөлінді. Гранттар бакалавриат бағдарламасы бойынша оқуға арналған. Оқу тілі вьетнам тілі болады, ал тілді меңгермеген үміткерлер бір жылдық тілдік курстан өте алады. Бұл ақпаратты «Халықаралық бағдарламалар орталығы» жариялады.",
  },
  {
    id: "kz-fake",
    chip: "Kazakh · FAKE",
    language: "Kazakh",
    label: "FAKE",
    source: "Stopfake.kz",
    text: "«Pfizer мен Johnson & Johnson вакциналарында микрочип бар! Бұл микроскоппен дәлелденген. Енді адамдарды толық бақылайды!»",
  },
  {
    id: "ru-real",
    chip: "Russian · REAL",
    language: "Russian",
    label: "REAL",
    source: "kazinform.kz",
    text: "В системе ОСМС внедрят новую цифровую платформу Qalqan. Она должна усилить контроль финансовых потоков, мониторинг расходов и выявление возможных нарушений. В рамках проекта также пересматриваются подходы к лимитированию медицинской помощи и оплате услуг. Внедрение платформы связано с созданием цифрового антифрод-контроля.",
  },
  {
    id: "ru-fake",
    chip: "Russian · FAKE",
    language: "Russian",
    label: "FAKE",
    source: "Stopfake.kz",
    text: "В Казахстане приняли закон о тотальной слежке за мессенджерами с 2024 года. Все переписки в WhatsApp, Telegram и Viber теперь читает КНБ автоматически. Срочно удалите личные переписки!",
  },
];
