from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class UserBase(BaseModel):
    full_name: str
    username: str
    role: Optional[str] = "usuário externo"
    icon: Optional[str] = "User"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_approved: bool

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class UserUpdateIcon(BaseModel):
    icon: str

class ServiceBase(BaseModel):
    macro_type: str
    category: str
    is_closed_system: Optional[bool] = None
    piping_material: Optional[str] = None
    diameter_mm: Optional[float] = None
    natural_influences: Optional[str] = None
    electrical_interferences: Optional[bool] = None
    materials_used: Optional[str] = None
    replaced_parts: Optional[str] = None

class ServiceCreate(ServiceBase):
    asset_id: int
    user_ids: List[int] = []
    date: Optional[date] = None

class ServiceUpdateDate(BaseModel):
    date: date

class Service(ServiceBase):
    id: int
    date: date
    users: List[UserResponse] = []

    class Config:
        from_attributes = True

class AssetBase(BaseModel):
    tag: str
    category: str
    humidity: Optional[float] = None
    interference: Optional[bool] = False
    failure_reported: Optional[bool] = False

class AssetCreate(AssetBase):
    system_id: int

class AssetResponse(AssetBase):
    id: int
    system_id: int
    last_maintenance: date
    priority_score: int
    failure_reported: bool
    kanban_status: str
    status: Optional[str] = None

    class Config:
        from_attributes = True

class AssetWithHistoryResponse(AssetResponse):
    services: List[Service] = []

    class Config:
        from_attributes = True

class SystemBase(BaseModel):
    name: str

class SystemResponse(SystemBase):
    id: int
    city_id: int
    assets: List[AssetResponse] = []

    class Config:
        from_attributes = True

class CityBase(BaseModel):
    name: str

class CityResponse(CityBase):
    id: int
    systems: List[SystemResponse] = []

    class Config:
        from_attributes = True

class DemandCreate(BaseModel):
    asset_id: int
    technician_name: str
    description: str
