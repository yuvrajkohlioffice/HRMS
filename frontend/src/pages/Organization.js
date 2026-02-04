import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { companyService } from '../services/companyService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Building2, Users, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const Organization = () => {
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showDeptDialog, setShowDeptDialog] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const [companyForm, setCompanyForm] = useState({
    name: '',
    code: '',
    country: '',
    currency: 'USD',
    timezone: 'UTC',
  });

  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const companiesData = await companyService.getCompanies();
      setCompanies(companiesData);

      if (user.company_id) {
        const [depts, branchesData] = await Promise.all([
          companyService.getDepartments(user.company_id),
          companyService.getBranches(user.company_id),
        ]);
        setDepartments(depts);
        setBranches(branchesData);
      }
    } catch (error) {
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await companyService.createCompany(companyForm);
      toast.success('Company created successfully');
      setShowCompanyDialog(false);
      setCompanyForm({ name: '', code: '', country: '', currency: 'USD', timezone: 'UTC' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create company');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await companyService.createDepartment(user.company_id, {
        ...deptForm,
        company_id: user.company_id,
      });
      toast.success('Department created successfully');
      setShowDeptDialog(false);
      setDeptForm({ name: '', code: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create department');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-700 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div data-testid="organization-page">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Organization Structure
          </h2>
          <p className="mt-1 text-sm text-slate-600">Manage companies, branches, departments, and teams</p>
        </div>

        <Tabs defaultValue="companies" className="w-full">
          <TabsList>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
          </TabsList>

          {/* Companies Tab */}
          <TabsContent value="companies" className="mt-6">
            <div className="mb-4 flex justify-between">
              <h3 className="text-lg font-semibold">Companies</h3>
              {user.role === 'super_admin' && (
                <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
                  <DialogTrigger asChild>
                    <Button data-testid="add-company-btn" className="bg-indigo-700 hover:bg-indigo-800">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Company</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCompany} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                          id="name"
                          data-testid="company-name-input"
                          required
                          value={companyForm.name}
                          onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="code">Company Code</Label>
                        <Input
                          id="code"
                          data-testid="company-code-input"
                          required
                          value={companyForm.code}
                          onChange={(e) => setCompanyForm({ ...companyForm, code: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          data-testid="company-country-input"
                          required
                          value={companyForm.country}
                          onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="currency">Currency</Label>
                          <Input
                            id="currency"
                            value={companyForm.currency}
                            onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="timezone">Timezone</Label>
                          <Input
                            id="timezone"
                            value={companyForm.timezone}
                            onChange={(e) => setCompanyForm({ ...companyForm, timezone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setShowCompanyDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" data-testid="submit-company-btn" className="bg-indigo-700 hover:bg-indigo-800">
                          Create Company
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <div
                  key={company.id}
                  data-testid={`company-card-${company.id}`}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-100 p-2">
                      <Building2 className="h-5 w-5 text-indigo-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{company.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{company.code}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>Country: {company.country}</p>
                    <p>Currency: {company.currency}</p>
                    <p>Timezone: {company.timezone}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="mt-6">
            <div className="mb-4 flex justify-between">
              <h3 className="text-lg font-semibold">Departments</h3>
              <Dialog open={showDeptDialog} onOpenChange={setShowDeptDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="add-department-btn" className="bg-indigo-700 hover:bg-indigo-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Department</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateDepartment} className="space-y-4">
                    <div>
                      <Label htmlFor="dept_name">Department Name</Label>
                      <Input
                        id="dept_name"
                        data-testid="dept-name-input"
                        required
                        value={deptForm.name}
                        onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dept_code">Department Code</Label>
                      <Input
                        id="dept_code"
                        data-testid="dept-code-input"
                        required
                        value={deptForm.code}
                        onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowDeptDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="submit-dept-btn" className="bg-indigo-700 hover:bg-indigo-800">
                        Create Department
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  data-testid={`dept-card-${dept.id}`}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Briefcase className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{dept.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{dept.code}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Branches</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  data-testid={`branch-card-${branch.id}`}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-100 p-2">
                      <Building2 className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{branch.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{branch.code}</p>
                    </div>
                  </div>
                  {branch.address && <p className="mt-3 text-sm text-slate-600">{branch.address}</p>}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Organization;
