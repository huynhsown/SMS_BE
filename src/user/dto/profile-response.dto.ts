export class ProfileResponseDto {
  _id: string;
  username: string;
  email: string;
  phone: string;     
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}