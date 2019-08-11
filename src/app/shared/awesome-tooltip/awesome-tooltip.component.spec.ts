import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwesomeTooltipComponent } from './awesome-tooltip.component';

describe('AwesomeTooltipComponentComponent', () => {
  let component: AwesomeTooltipComponent;
  let fixture: ComponentFixture<AwesomeTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwesomeTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwesomeTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
