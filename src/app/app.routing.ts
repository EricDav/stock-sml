import { Routes, RouterModule } from '@angular/router';

// import { HomeComponent } from './home';
import { LoginComponent } from './login/login.component';
import { StockListComponent } from './stock-list/stock-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { AuthGuard } from './_guard/auth.guard';

const routes: Routes = [
    { path: '', component: StockListComponent },
    { path: 'login', component: LoginComponent },
    { path: 'forget-password', component: ForgetPasswordComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);