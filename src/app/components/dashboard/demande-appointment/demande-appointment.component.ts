import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Appointments } from 'src/app/models/apointment';
import { DOMAINESAGRICULTURE, SPECIALITES, SUJETAGRICULTURE, TYPEAGRICULTURE, TYPECULTURES } from 'src/app/models/constants/constants';
import { IOptions } from 'src/app/models/constants/time-options';
import { DemandeAppointment } from 'src/app/models/demandeAppointment';
import { Terrain } from 'src/app/models/terrain';
import { DemandeAppointmentService } from 'src/app/services/demande-appointment.service';
import { TerrainService } from 'src/app/services/terrain.service';

@Component({
  selector: 'app-demande-appointment',
  templateUrl: './demande-appointment.component.html',
  styleUrls: ['./demande-appointment.component.css']
})
export class DemandeAppointmentComponent implements OnInit {

  @ViewChild('firstTabButton') firstTabButton!: ElementRef;
  @ViewChild('secondTabButton') secondTabButton!: ElementRef;
  @ViewChild('thirdTabButton') thirdTabButton!: ElementRef;

  demandeAppointementForm: FormGroup;

  specialistes = SPECIALITES;
  domaines = DOMAINESAGRICULTURE;
  sujetAgricultures = SUJETAGRICULTURE;
  typeAgricultures = TYPEAGRICULTURE;
  typeCultures = TYPECULTURES;

  terrains : Terrain[];

  isFirstTabDisabled = false;
  isSecondTabDisabled = true;
  isThirdTabDisabled = true;
  
  showError = false;
  validationErrors = [];

  periodes = [
    { id: 'matin', label: 'الفترة الصباحية', value: 'الفترة الصباحية', checked: true },
    { id: 'soir', label: 'الفترة المسائية', value: 'الفترة المسائية', checked: false },
  ];

  revoirOptions = [
    { id: 'visite', label: 'زيارة ميدانية', value: 'زيارة ميدانية' },
    { id: 'aDistance', label: 'مقابلة عبر الإنترنت', value: 'مقابلة عبر الإنترنت' }
  ];

  minDate: Date;

  myTime: Date;
  minTime: Date = new Date();
  maxTime: Date = new Date();
  isMeridian = false;

  updateTimeRange(periode: any) {
    if (periode === 'الفترة الصباحية') {
      this.minTime.setHours(8);
      this.minTime.setMinutes(0);
      const defaultDate = new Date();
      defaultDate.setHours(9); 
      defaultDate.setMinutes(0);0
      defaultDate.setSeconds(0);
      this.demandeAppointementForm.get('timepickerControl').setValue(defaultDate);
      this.maxTime.setHours(11);
      this.maxTime.setMinutes(30);
  } else if (periode === 'الفترة المسائية') {
    console.log("lil ", this.minTime, this.maxTime)
    this.maxTime.setHours(16);
    this.maxTime.setMinutes(30);
    const defaultDate = new Date();
    defaultDate.setHours(13); 
    defaultDate.setMinutes(0); 
    defaultDate.setSeconds(0);
    this.demandeAppointementForm.get('timepickerControl').setValue(defaultDate);
    this.minTime.setHours(13);
    this.minTime.setMinutes(0);
    }
  }
  


  // isMorning: boolean = true; // Assuming initially it's morning
  // timepickerForm: FormGroup;
  // minMorningTime = { hour: 9, minute: 30 };
  // maxMorningTime = { hour: 11, minute: 30 };
  // minEveningTime = { hour: 13, minute: 30 };
  // maxEveningTime = { hour: 16, minute: 30 };

  
  // toggleTime() {
  //   this.isMorning = !this.isMorning;
  // }

  // get minTime() {
  //   return this.isMorning ? this.minMorningTime : this.minEveningTime;
  // }

  // get maxTime() {
  //   return this.isMorning ? this.maxMorningTime : this.maxEveningTime;
  // }

  bsInlineValue = new Date();
  bsInlineRangeValue: Date[];
  tempDemandeForm: DemandeAppointment;
  tempAppointmentForm: Appointments;
  option: IOptions;
  selectedHour: number | undefined;
  selectedMinute: number | undefined;


  constructor(private fb: FormBuilder, private terrainService : TerrainService, private demandeAppointmentService : DemandeAppointmentService) {
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate());
    this.minTime.setHours(8);
    this.minTime.setMinutes(0);
    this.maxTime.setHours(11);
    this.maxTime.setMinutes(30);
  }

  ngOnInit(): void {

    this.terrainService.getAgriculteurTerrains().subscribe({
      next: _ => {
        this.terrains = _ ;
      },
      error: e => {
        this.showError = true;
        this.validationErrors = e.error;
      } 
    })

    this.initializeDemandeAppointementForm();
  }

  initializeDemandeAppointementForm() {

    const defaultDate = new Date();
    defaultDate.setHours(9); // Set hours to 9
    defaultDate.setMinutes(0); // Set minutes to 0
    defaultDate.setSeconds(0); // Set seconds to 0

    this.demandeAppointementForm = this.fb.group({
      specialite: ['', Validators.required],
      domaine: ['', Validators.required],
      typeCulturesArray: [[], [this.atLeastOneSelectedValidator(1)]],
      typeAgriculture: ['', Validators.required],
      sujetAgriculture: ['', Validators.required],
      terrain: [[], [this.atLeastOneSelectedValidator(1)]],
      question: ['', Validators.required],
      
      file: [''],  

      methodeRevoir: [''], // Add validators as needed
      timepickerControl: [defaultDate], // Initialize with default value if needed
      periode: [''], // Add validators as needed
      datepickerControl: [''] // Initialize with default value if needed
    });
  }

  // Define a custom validator function to check if at least one value is selected
  atLeastOneSelectedValidator(minSelections: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedValues = control.value;
      if (!selectedValues || selectedValues.length < minSelections) {
        return { 'atLeastOneSelected': true };
      }
      return null;
    };
  }


  moveToSecondTab(buttonRef: ElementRef) {
    // Mark all form controls as touched to trigger validation
    this.demandeAppointementForm.markAllAsTouched();
    this.showError = false;

    // Check if the form is invalid
    if (this.demandeAppointementForm.invalid) {
      // Clear the validationErrors array before adding new errors
      this.showError = true;
      this.validationErrors = [];
  
      // Loop through each form control
      Object.keys(this.demandeAppointementForm.controls).forEach(key => {
        const control = this.demandeAppointementForm.get(key);
  
        // Check if the control is invalid and has been touched
        if (control.invalid && control.touched) {
          // Get validation messages for the current control
          Object.keys(control.errors).forEach(errorKey => {
            // Add validation error message to the validationErrors array
            this.validationErrors.push(`${key}: ${this.getErrorMessage(errorKey)}`);
          });
        }
      });
  
      // Log the validation errors to the console
      console.log('Validation errors:', this.validationErrors);
    }
  
    // Log the form values to the console
    console.log(this.demandeAppointementForm.value);

    this.isFirstTabDisabled = true;
    this.isSecondTabDisabled = false;
    this.isThirdTabDisabled = true;
  
    // Remove 'active' class from the first tab button
    this.firstTabButton.nativeElement.classList.remove('active');
    // Add 'active' class to the second tab button
    this.secondTabButton.nativeElement.classList.add('active');

    // Update the active tab content
    const secondTabContent = document.getElementById('second');
    if (secondTabContent) {
      secondTabContent.classList.add('active', 'show');
    }
    const firstTabContent = document.getElementById('first');
    if (firstTabContent) {
      firstTabContent.classList.remove('active', 'show');
    }
  }

  moveToThirdTab(buttonRef: ElementRef) {
  
    // Log the form values to the console
    console.log(this.demandeAppointementForm.value);

    this.isFirstTabDisabled = true;
    this.isSecondTabDisabled = true;
    this.isThirdTabDisabled = false;
  
    // Remove 'active' class from the second tab button
    this.secondTabButton.nativeElement.classList.remove('active');
    // Add 'active' class to the third tab button
    this.thirdTabButton.nativeElement.classList.add('active');

    // Update the active tab content
    const thirdTabContent = document.getElementById('third');
    if (thirdTabContent) {
      thirdTabContent.classList.add('active', 'show');
    }
    const secondTabContent = document.getElementById('second');
    if (secondTabContent) {
      secondTabContent.classList.remove('active', 'show');
    }


  }

  // Helper method to get error messages based on error key
  getErrorMessage(errorKey: string): string {
    // Define error messages for each error key
    const errorMessages = {
      required: 'This field is required.',
      // Add more error messages for other error keys if needed
    };
  
    // Return the corresponding error message or a default message if not found
    return errorMessages[errorKey] || 'Invalid value.';
  }
  

  
  SaveDemande() {

    // this.demandeAppointementForm.markAllAsTouched();

    // if(this.demandeAppointementForm.invalid){
    //   // Log the form errors to the console
    //   console.log('Form errors:', this.demandeAppointementForm.errors);
    // }
    console.log(this.demandeAppointementForm.value);

    this.demandeAppointmentService.create(this.demandeAppointementForm.value).subscribe({
      next: () => {
        console.log(this.demandeAppointementForm.value);
      },
      error: error => {
        this.validationErrors = error
      } 
    })
  }
}
