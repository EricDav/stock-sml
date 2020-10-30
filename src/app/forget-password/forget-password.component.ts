import { Component, OnInit } from '@angular/core';
import bcrypt from 'bcryptjs';
import { AuthenticationService } from '../_services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {
  forgetPasswordForm: FormGroup;
  hash: "";

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.forgetPasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
  });
  }

  get f() { return this.forgetPasswordForm.controls; }

  onSubmit() {
    if (this.f.password.value != this.f.confirmPassword.value) {
      alert("Passwords do not match");
      return;
    }
    this.hash = bcrypt.hashSync(this.f.password.value, 10);
  }

}
