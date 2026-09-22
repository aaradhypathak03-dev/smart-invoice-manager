from pydantic import BaseModel, ConfigDict


class VendorBase(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class VendorCreate(VendorBase):
    pass


class VendorUpdate(VendorBase):
    pass


class VendorOut(VendorBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
