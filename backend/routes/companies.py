from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorClient
from models.company import Company, CompanyCreate, CompanyUpdate, Branch, BranchCreate, Department, DepartmentCreate, Team, TeamCreate
from utils.auth import get_current_user
from utils.helpers import generate_id
from datetime import datetime, timezone
from typing import List
import os

router = APIRouter(prefix="/companies", tags=["Companies"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post("", response_model=Company, status_code=status.HTTP_201_CREATED)
async def create_company(company_data: CompanyCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can create companies"
        )
    
    company_dict = company_data.model_dump()
    company_dict["id"] = generate_id()
    company_dict["is_active"] = True
    company_dict["is_deleted"] = False
    company_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    company_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.companies.insert_one(company_dict)
    return Company(**company_dict)

@router.get("", response_model=List[Company])
async def list_companies(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "super_admin":
        companies = await db.companies.find({"is_deleted": False}, {"_id": 0}).to_list(1000)
    else:
        companies = await db.companies.find(
            {"id": current_user["company_id"], "is_deleted": False},
            {"_id": 0}
        ).to_list(1000)
    return companies

@router.get("/{company_id}", response_model=Company)
async def get_company(company_id: str, current_user: dict = Depends(get_current_user)):
    company = await db.companies.find_one({"id": company_id, "is_deleted": False}, {"_id": 0})
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return Company(**company)

@router.put("/{company_id}", response_model=Company)
async def update_company(company_id: str, update_data: CompanyUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["super_admin", "company_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.companies.update_one(
        {"id": company_id, "is_deleted": False},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    return Company(**company)

@router.post("/{company_id}/branches", response_model=Branch, status_code=status.HTTP_201_CREATED)
async def create_branch(company_id: str, branch_data: BranchCreate, current_user: dict = Depends(get_current_user)):
    branch_dict = branch_data.model_dump()
    branch_dict["id"] = generate_id()
    branch_dict["is_active"] = True
    branch_dict["is_deleted"] = False
    branch_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    branch_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.branches.insert_one(branch_dict)
    return Branch(**branch_dict)

@router.get("/{company_id}/branches", response_model=List[Branch])
async def list_branches(company_id: str, current_user: dict = Depends(get_current_user)):
    branches = await db.branches.find({"company_id": company_id, "is_deleted": False}, {"_id": 0}).to_list(1000)
    return branches

@router.post("/{company_id}/departments", response_model=Department, status_code=status.HTTP_201_CREATED)
async def create_department(company_id: str, dept_data: DepartmentCreate, current_user: dict = Depends(get_current_user)):
    dept_dict = dept_data.model_dump()
    dept_dict["id"] = generate_id()
    dept_dict["is_active"] = True
    dept_dict["is_deleted"] = False
    dept_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    dept_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.departments.insert_one(dept_dict)
    return Department(**dept_dict)

@router.get("/{company_id}/departments", response_model=List[Department])
async def list_departments(company_id: str, current_user: dict = Depends(get_current_user)):
    departments = await db.departments.find({"company_id": company_id, "is_deleted": False}, {"_id": 0}).to_list(1000)
    return departments

@router.post("/{company_id}/teams", response_model=Team, status_code=status.HTTP_201_CREATED)
async def create_team(company_id: str, team_data: TeamCreate, current_user: dict = Depends(get_current_user)):
    team_dict = team_data.model_dump()
    team_dict["id"] = generate_id()
    team_dict["is_active"] = True
    team_dict["is_deleted"] = False
    team_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    team_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.teams.insert_one(team_dict)
    return Team(**team_dict)

@router.get("/{company_id}/teams", response_model=List[Team])
async def list_teams(company_id: str, current_user: dict = Depends(get_current_user)):
    teams = await db.teams.find({"company_id": company_id, "is_deleted": False}, {"_id": 0}).to_list(1000)
    return teams
