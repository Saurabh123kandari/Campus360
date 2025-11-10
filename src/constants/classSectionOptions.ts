export interface DropdownOption {
  label: string;
  value: string;
}

export const CLASS_OPTIONS: DropdownOption[] = Array.from({ length: 12 }, (_, index) => {
  const value = `${index + 1}`;
  return {
    label: value,
    value,
  };
});

export const SECTION_OPTIONS: DropdownOption[] = ['A', 'B', 'C', 'D', 'E', 'F'].map((section) => ({
  label: section,
  value: section,
}));


