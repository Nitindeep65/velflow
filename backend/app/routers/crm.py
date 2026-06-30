from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.counterparty import Counterparty
from app.models.pipeline import Pipeline
from app.models.contract import Contract
from app.models.task import Task
from app.schemas.crm import (
    CounterpartyCreate,
    CounterpartyUpdate,
    CounterpartyResponse,
    PipelineCreate,
    PipelineUpdate,
    PipelineResponse,
)
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/crm", tags=["crm"])

# --- COUNTERPARTIES ENDPOINTS ---

@router.get("/counterparties", response_model=List[CounterpartyResponse])
def get_counterparties(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    counterparties = db.query(Counterparty).filter(Counterparty.owner_id == current_user.id).all()
    
    # Calculate associated contracts count for each counterparty
    response_list = []
    for cp in counterparties:
        contracts_count = db.query(Contract).filter(
            Contract.counterparty_id == cp.id,
            Contract.owner_id == current_user.id
        ).count()
        
        response_list.append(CounterpartyResponse(
            id=cp.id,
            company_name=cp.company_name,
            primary_contact_email=cp.primary_contact_email,
            contact_phone=cp.contact_phone,
            billing_address=cp.billing_address,
            industry=cp.industry,
            notes=cp.notes,
            owner_id=cp.owner_id,
            created_at=cp.created_at,
            contracts_count=contracts_count
        ))
        
    return response_list

@router.post("/counterparties", response_model=CounterpartyResponse, status_code=status.HTTP_201_CREATED)
def create_counterparty(
    schema: CounterpartyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_cp = Counterparty(
        **schema.model_dump(),
        owner_id=current_user.id
    )
    db.add(db_cp)
    db.commit()
    db.refresh(db_cp)
    return CounterpartyResponse(
        id=db_cp.id,
        company_name=db_cp.company_name,
        primary_contact_email=db_cp.primary_contact_email,
        contact_phone=db_cp.contact_phone,
        billing_address=db_cp.billing_address,
        industry=db_cp.industry,
        notes=db_cp.notes,
        owner_id=db_cp.owner_id,
        created_at=db_cp.created_at,
        contracts_count=0
    )

@router.put("/counterparties/{id}", response_model=CounterpartyResponse)
def update_counterparty(
    id: int,
    schema: CounterpartyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_cp = db.query(Counterparty).filter(
        Counterparty.id == id,
        Counterparty.owner_id == current_user.id
    ).first()
    
    if not db_cp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Counterparty not found"
        )
        
    for key, val in schema.model_dump(exclude_unset=True).items():
        setattr(db_cp, key, val)
        
    db.commit()
    db.refresh(db_cp)
    
    contracts_count = db.query(Contract).filter(
        Contract.counterparty_id == db_cp.id,
        Contract.owner_id == current_user.id
    ).count()
    
    return CounterpartyResponse(
        id=db_cp.id,
        company_name=db_cp.company_name,
        primary_contact_email=db_cp.primary_contact_email,
        contact_phone=db_cp.contact_phone,
        billing_address=db_cp.billing_address,
        industry=db_cp.industry,
        notes=db_cp.notes,
        owner_id=db_cp.owner_id,
        created_at=db_cp.created_at,
        contracts_count=contracts_count
    )

@router.delete("/counterparties/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_counterparty(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_cp = db.query(Counterparty).filter(
        Counterparty.id == id,
        Counterparty.owner_id == current_user.id
    ).first()
    
    if not db_cp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Counterparty not found"
        )
        
    db.delete(db_cp)
    db.commit()
    return

# --- PIPELINE ENDPOINTS ---

@router.get("/pipelines", response_model=List[PipelineResponse])
def get_pipelines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pipelines = db.query(Pipeline).filter(Pipeline.owner_id == current_user.id).all()
    
    response_list = []
    for pipe in pipelines:
        cp_name = None
        if pipe.counterparty_id:
            cp = db.query(Counterparty).filter(Counterparty.id == pipe.counterparty_id).first()
            if cp:
                cp_name = cp.company_name
                
        contracts_count = db.query(Contract).filter(
            Contract.pipeline_id == pipe.id,
            Contract.owner_id == current_user.id
        ).count()
        
        response_list.append(PipelineResponse(
            id=pipe.id,
            deal_name=pipe.deal_name,
            stage=pipe.stage,
            value=pipe.value,
            counterparty_id=pipe.counterparty_id,
            owner_id=pipe.owner_id,
            created_at=pipe.created_at,
            counterparty_name=cp_name,
            contracts_count=contracts_count
        ))
        
    return response_list

@router.post("/pipelines", response_model=PipelineResponse, status_code=status.HTTP_201_CREATED)
def create_pipeline(
    schema: PipelineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify counterparty exists if provided
    cp_name = None
    if schema.counterparty_id:
        cp = db.query(Counterparty).filter(
            Counterparty.id == schema.counterparty_id,
            Counterparty.owner_id == current_user.id
        ).first()
        if not cp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Counterparty not found"
            )
        cp_name = cp.company_name
        
    db_pipe = Pipeline(
        **schema.model_dump(),
        owner_id=current_user.id
    )
    db.add(db_pipe)
    db.commit()
    db.refresh(db_pipe)
    
    return PipelineResponse(
        id=db_pipe.id,
        deal_name=db_pipe.deal_name,
        stage=db_pipe.stage,
        value=db_pipe.value,
        counterparty_id=db_pipe.counterparty_id,
        owner_id=db_pipe.owner_id,
        created_at=db_pipe.created_at,
        counterparty_name=cp_name,
        contracts_count=0
    )

@router.put("/pipelines/{id}", response_model=PipelineResponse)
def update_pipeline(
    id: int,
    schema: PipelineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_pipe = db.query(Pipeline).filter(
        Pipeline.id == id,
        Pipeline.owner_id == current_user.id
    ).first()
    
    if not db_pipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline item not found"
        )
        
    # Verify counterparty exists if updated
    if schema.counterparty_id is not None:
        cp = db.query(Counterparty).filter(
            Counterparty.id == schema.counterparty_id,
            Counterparty.owner_id == current_user.id
        ).first()
        if not cp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Counterparty not found"
            )
            
    for key, val in schema.model_dump(exclude_unset=True).items():
        setattr(db_pipe, key, val)
        
    db.commit()
    db.refresh(db_pipe)
    
    cp_name = None
    if db_pipe.counterparty_id:
        cp = db.query(Counterparty).filter(Counterparty.id == db_pipe.counterparty_id).first()
        if cp:
            cp_name = cp.company_name
            
    contracts_count = db.query(Contract).filter(
        Contract.pipeline_id == db_pipe.id,
        Contract.owner_id == current_user.id
    ).count()
    
    return PipelineResponse(
        id=db_pipe.id,
        deal_name=db_pipe.deal_name,
        stage=db_pipe.stage,
        value=db_pipe.value,
        counterparty_id=db_pipe.counterparty_id,
        owner_id=db_pipe.owner_id,
        created_at=db_pipe.created_at,
        counterparty_name=cp_name,
        contracts_count=contracts_count
    )

@router.delete("/pipelines/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pipeline(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_pipe = db.query(Pipeline).filter(
        Pipeline.id == id,
        Pipeline.owner_id == current_user.id
    ).first()
    
    if not db_pipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline item not found"
        )
        
    # Clean up associated contract references
    associated_contracts = db.query(Contract).filter(Contract.pipeline_id == id).all()
    for contract in associated_contracts:
        contract.pipeline_id = None
        
    db.delete(db_pipe)
    db.commit()
    return

# --- SEEDING ENDPOINT ---

@router.post("/seed", status_code=status.HTTP_200_OK)
def seed_crm_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user already has counterparties
    existing_cp = db.query(Counterparty).filter(Counterparty.owner_id == current_user.id).first()
    if existing_cp:
        return {"detail": "Database already seeded or contains CRM records."}
        
    # Create sample counterparties
    acme = Counterparty(
        company_name="Acme Corporation",
        primary_contact_email="legal@acme.com",
        contact_phone="+1 (555) 019-2834",
        billing_address="123 Industrial Parkway, Suite A, San Jose, CA 95112",
        industry="SaaS & Software",
        notes="Strategic account, prefers standard liability clauses. Fast billing authorization.",
        owner_id=current_user.id
    )
    globex = Counterparty(
        company_name="Globex Industries",
        primary_contact_email="agreements@globex.org",
        contact_phone="+1 (555) 901-3829",
        billing_address="888 Terror Way, Cypress Creek, OR 97401",
        industry="Industrial Engineering",
        notes="High complexity contract processes. Demands custom IP ownership clauses and Delaware governance.",
        owner_id=current_user.id
    )
    initech = Counterparty(
        company_name="Initech LLC",
        primary_contact_email="lumbergh@initech.com",
        contact_phone="+1 (555) 432-1098",
        billing_address="4120 Freemont Ave, Austin, TX 78701",
        industry="Professional Services",
        notes="Consulting partner. Invoicing scheduled quarterly.",
        owner_id=current_user.id
    )
    stark = Counterparty(
        company_name="Stark Enterprises",
        primary_contact_email="contracts@stark.com",
        contact_phone="+1 (555) 300-3000",
        billing_address="10880 El Rocko Way, Malibu, CA 90265",
        industry="Aerospace & Defense",
        notes="Enterprise client requiring strict SLA compliance timelines.",
        owner_id=current_user.id
    )
    
    db.add_all([acme, globex, initech, stark])
    db.commit()
    
    # Create sample pipelines (deals) linked to these counterparties
    deals = [
        Pipeline(
            deal_name="Acme Enterprise SaaS Subscription",
            stage="Signed",
            value=120000.00,
            counterparty_id=acme.id,
            owner_id=current_user.id
        ),
        Pipeline(
            deal_name="Globex Security Infrastructure Consultation",
            stage="In Negotiation",
            value=75000.00,
            counterparty_id=globex.id,
            owner_id=current_user.id
        ),
        Pipeline(
            deal_name="Initech Staffing Master Services Agreement",
            stage="Drafting",
            value=24000.00,
            counterparty_id=initech.id,
            owner_id=current_user.id
        ),
        Pipeline(
            deal_name="Stark Arc-Reactor Integration licensing",
            stage="Out for Signature",
            value=450000.00,
            counterparty_id=stark.id,
            owner_id=current_user.id
        ),
        Pipeline(
            deal_name="Aperture Labs NDA Exchange",
            stage="Active",
            value=0.00,
            counterparty_id=None,
            owner_id=current_user.id
        )
    ]
    
    db.add_all(deals)
    db.commit()
    
    # Associate any existing contracts to these counterparties to make it look linked
    existing_contracts = db.query(Contract).filter(Contract.owner_id == current_user.id).all()
    for index, contract in enumerate(existing_contracts):
        # Evenly map to counterparties
        if index % 4 == 0:
            contract.counterparty_id = acme.id
            contract.pipeline_id = deals[0].id
        elif index % 4 == 1:
            contract.counterparty_id = globex.id
            contract.pipeline_id = deals[1].id
        elif index % 4 == 2:
            contract.counterparty_id = initech.id
            contract.pipeline_id = deals[2].id
        else:
            contract.counterparty_id = stark.id
            contract.pipeline_id = deals[3].id
            
    db.commit()

    # Seed default tasks linked to contracts if contracts exist
    from datetime import date as dt_date, timedelta
    
    t1 = Task(
        title="Review SLA compliance report",
        description="Verify Provider meets 99.9% uptime requirement as stated in Stark licensing.",
        due_date=dt_date.today() + timedelta(days=14),
        completed=False,
        owner_id=current_user.id
    )
    t2 = Task(
        title="Deliver quarterly security audit logs",
        description="Globex requires strict SOC 2 audit log deliveries every quarter.",
        due_date=dt_date.today() + timedelta(days=30),
        completed=False,
        owner_id=current_user.id
    )
    t3 = Task(
        title="Renew SaaS platform subscription fee",
        description="Acme SaaS agreement renewal invoice review and payment schedule confirmation.",
        due_date=dt_date.today() + timedelta(days=45),
        completed=False,
        owner_id=current_user.id
    )
    t4 = Task(
        title="Submit quarterly staffing feedback reports",
        description="Review lumbergh feedback regarding consultants delivery performance.",
        due_date=dt_date.today() + timedelta(days=7),
        completed=True,
        owner_id=current_user.id
    )
    
    # Link tasks to seeded contracts if existing contracts were updated
    for index, contract in enumerate(existing_contracts):
        if index % 4 == 0:
            t3.contract_id = contract.id
        elif index % 4 == 1:
            t2.contract_id = contract.id
        elif index % 4 == 3:
            t1.contract_id = contract.id
            
    db.add_all([t1, t2, t3, t4])
    db.commit()
    return {"detail": "Successfully seeded CRM database."}

# --- TASKS ENDPOINTS ---

@router.get("/tasks", response_model=List[TaskResponse])
def get_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = db.query(Task).filter(Task.owner_id == current_user.id).all()
    
    response_list = []
    for task in tasks:
        contract_name = None
        if task.contract_id:
            c = db.query(Contract).filter(Contract.id == task.contract_id).first()
            if c:
                contract_name = c.name
                
        response_list.append(TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            due_date=task.due_date,
            completed=task.completed,
            contract_id=task.contract_id,
            owner_id=task.owner_id,
            created_at=task.created_at,
            contract_name=contract_name
        ))
    return response_list

@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    schema: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contract_name = None
    if schema.contract_id:
        c = db.query(Contract).filter(
            Contract.id == schema.contract_id,
            Contract.owner_id == current_user.id
        ).first()
        if not c:
            raise HTTPException(status_code=400, detail="Linked contract not found")
        contract_name = c.name
        
    db_task = Task(
        **schema.model_dump(),
        owner_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return TaskResponse(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        due_date=db_task.due_date,
        completed=db_task.completed,
        contract_id=db_task.contract_id,
        owner_id=db_task.owner_id,
        created_at=db_task.created_at,
        contract_name=contract_name
    )

@router.put("/tasks/{id}", response_model=TaskResponse)
def update_task(
    id: int,
    schema: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_task = db.query(Task).filter(
        Task.id == id,
        Task.owner_id == current_user.id
    ).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if schema.contract_id is not None:
        c = db.query(Contract).filter(
            Contract.id == schema.contract_id,
            Contract.owner_id == current_user.id
        ).first()
        if not c:
            raise HTTPException(status_code=400, detail="Linked contract not found")
            
    for key, val in schema.model_dump(exclude_unset=True).items():
        setattr(db_task, key, val)
        
    db.commit()
    db.refresh(db_task)
    
    contract_name = None
    if db_task.contract_id:
        c = db.query(Contract).filter(Contract.id == db_task.contract_id).first()
        if c:
            contract_name = c.name
            
    return TaskResponse(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        due_date=db_task.due_date,
        completed=db_task.completed,
        contract_id=db_task.contract_id,
        owner_id=db_task.owner_id,
        created_at=db_task.created_at,
        contract_name=contract_name
    )

@router.delete("/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_task = db.query(Task).filter(
        Task.id == id,
        Task.owner_id == current_user.id
    ).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db.delete(db_task)
    db.commit()
    return
