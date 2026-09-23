export interface Room {
  id: number;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  maxCapacity: number | null;
  active: boolean;
}
