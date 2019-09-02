import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamRoasterComponent } from './team-roaster.component';

describe('TeamRoasterComponent', () => {
  let component: TeamRoasterComponent;
  let fixture: ComponentFixture<TeamRoasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamRoasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamRoasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
