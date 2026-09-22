from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.vendor import Vendor
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorOut
from app.services.auth_deps import get_current_user

router = APIRouter(prefix="/api/vendors", tags=["vendors"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=VendorOut, status_code=status.HTTP_201_CREATED)
def create_vendor(payload: VendorCreate, db: Session = Depends(get_db)):
    vendor = Vendor(**payload.model_dump())
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.get("", response_model=list[VendorOut])
def list_vendors(db: Session = Depends(get_db)):
    return db.execute(select(Vendor).order_by(Vendor.name)).scalars().all()


@router.get("/{vendor_id}", response_model=VendorOut)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.put("/{vendor_id}", response_model=VendorOut)
def update_vendor(vendor_id: int, payload: VendorUpdate, db: Session = Depends(get_db)):
    vendor = db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for key, value in payload.model_dump().items():
        setattr(vendor, key, value)
    db.commit()
    db.refresh(vendor)
    return vendor
