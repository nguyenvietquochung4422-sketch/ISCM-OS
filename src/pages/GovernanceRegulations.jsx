export default function GovernanceRegulations({ section }) {
  
  if (section === 'placeholder-cr1') {
    return (
      <div className="w-full space-y-6 font-ibm text-sm">
        <header className="border-l-4 border-iscm-crimson pl-4 py-1 mb-6">
          <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            Rules &amp; Regulations
          </h1>
          <p className="font-ibm text-sm uppercase tracking-wider text-gray-500 mt-1">
            Quy định vận hành &amp; Nội quy làm việc nội bộ tại ISCM.
          </p>
        </header>

        <section className="glass-card p-6 space-y-4">
          <h2 className="font-barlow text-xl font-bold text-iscm-charcoal border-l-2 border-iscm-crimson pl-2 border-b border-gray-100 pb-2">
            Rules and Regulations
          </h2>
          
          <div className="bg-iscm-surface p-4 rounded-xl border border-gray-200 text-sm font-ibm leading-relaxed text-iscm-charcoal space-y-3">
            <p className="font-medium text-iscm-crimson">
              Official Policy Reference
            </p>
            <p>
              This is the official reference source for ISCM policies and regulations.
            </p>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide leading-relaxed">
                Requirement: All ISCM members are responsible for proactively reviewing and complying with these regulations. A clear understanding of the rules ensures proper workflow execution, smooth coordination between departments, and minimizes operational errors.
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <h3 className="font-barlow text-xs font-bold uppercase tracking-wider text-gray-400">Form Directory</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow text-left group">
                <span className="font-ibm text-sm font-semibold text-iscm-charcoal truncate">
                  Internal Working Regulations at ISCM
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0 border border-gray-200 px-2 py-0.5 rounded group-hover:border-iscm-crimson group-hover:text-iscm-crimson transition-colors">
                  Download
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (section === 'placeholder-cr2') {
    return (
      <div className="w-full space-y-6 font-ibm text-sm">
        <header className="border-l-4 border-iscm-crimson pl-4 py-1 mb-6">
          <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            Finance &amp; Payments
          </h1>
          <p className="font-ibm text-sm uppercase tracking-wider text-gray-500 mt-1">
            Quy chế chi tiêu và quy trình thanh toán tài chính ISCM.
          </p>
        </header>

        <section className="glass-card p-6 space-y-6">
          <div>
            <h2 className="font-barlow text-xl font-bold text-iscm-charcoal border-l-2 border-iscm-crimson pl-2 border-b border-gray-100 pb-2">
              Spending Regulations &amp; Payment Procedures
            </h2>
          </div>

          {/* I. Financial Regulations System */}
          <div className="space-y-3">
            <h3 className="font-barlow text-sm font-bold text-iscm-charcoal uppercase tracking-wider">
              I. Financial Regulations System (02 Tracks)
            </h3>
            <p className="font-ibm text-sm text-gray-500">
              All financial inflows and outflows at ISCM are managed and cross-checked based on two regulatory systems (updated annually):
            </p>
            <div className="grid gap-4 sm:grid-cols-2 mt-2">
              <div className="bg-iscm-surface p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="font-barlow-condensed text-xs font-bold uppercase tracking-wider bg-iscm-crimson/10 text-iscm-crimson px-2 py-0.5 rounded">
                  Track 1
                </span>
                <h4 className="font-ibm text-sm font-bold text-iscm-charcoal">UEH Internal Financial Regulations</h4>
                <p className="font-ibm text-xs text-gray-600 leading-relaxed">
                  Defines standard expenditure levels of the University for education activities, scientific research, and domestic/international travel expenses. (Accessible via the UEHer system).
                </p>
              </div>
              <div className="bg-iscm-surface p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="font-barlow-condensed text-xs font-bold uppercase tracking-wider bg-iscm-charcoal text-white px-2 py-0.5 rounded">
                  Track 2
                </span>
                <h4 className="font-ibm text-sm font-bold text-iscm-charcoal">ISCM Internal Financial Regulations</h4>
                <p className="font-ibm text-xs text-gray-600 leading-relaxed">
                  Defines specific spending and incentive mechanisms funded by ISCM’s internal budget. Applied to expenses outside UEH regulations or items not covered by approved UEH plans/proposals.
                </p>
              </div>
            </div>
          </div>

          {/* II. Payment Workflow Classification */}
          <div className="space-y-3">
            <h3 className="font-barlow text-sm font-bold text-iscm-charcoal uppercase tracking-wider">
              II. Payment Workflow Classification (04 Flows)
            </h3>
            <p className="font-ibm text-sm text-gray-500">
              To ensure accurate budget source allocation and efficient processing, payment procedures are divided into four workflows:
            </p>
            
            <div className="space-y-3 mt-2">
              {/* Flow 1 */}
              <div className="bg-white p-3 rounded-lg border border-gray-100 flex items-start gap-3">
                <span className="font-barlow-condensed text-xs font-bold bg-gray-100 text-gray-700 h-6 w-6 rounded-full flex items-center justify-center shrink-0">1</span>
                <div className="text-sm font-ibm text-iscm-charcoal space-y-1">
                  <h4 className="font-bold">Individual Payment <span className="font-normal text-gray-400">· Track 1 applicable</span></h4>
                  <p className="text-gray-500">Categories: Travel expenses, teaching remuneration, personal advance payments.</p>
                  <p className="text-xs font-semibold text-iscm-crimson">Responsible party: Members handle self-payment procedures directly with UEH Finance &amp; Accounting Department.</p>
                </div>
              </div>

              {/* Flow 2 */}
              <div className="bg-white p-3 rounded-lg border border-gray-100 flex items-start gap-3">
                <span className="font-barlow-condensed text-xs font-bold bg-gray-100 text-gray-700 h-6 w-6 rounded-full flex items-center justify-center shrink-0">2</span>
                <div className="text-sm font-ibm text-iscm-charcoal space-y-1">
                  <h4 className="font-bold">Event / Project / Research Payment <span className="font-normal text-gray-400">· Track 1 applicable</span></h4>
                  <p className="text-gray-500">Categories: Event organization costs, research funding, project equipment procurement, etc.</p>
                  <p className="text-xs font-semibold text-iscm-crimson">Responsible party: Direct project owners (Head, Lead, Manager, Coordinator, Host).</p>
                </div>
              </div>

              {/* Flow 3 */}
              <div className="bg-white p-3 rounded-lg border border-gray-100 flex items-start gap-3">
                <span className="font-barlow-condensed text-xs font-bold bg-gray-100 text-gray-700 h-6 w-6 rounded-full flex items-center justify-center shrink-0">3</span>
                <div className="text-sm font-ibm text-iscm-charcoal space-y-1">
                  <h4 className="font-bold">ISCM Fund Payment (with UEH) <span className="font-normal text-gray-400">· Track 1 applicable</span></h4>
                  <p className="text-gray-500">Categories: Operational costs, large-scale event series, or fund disbursement through UEH systems.</p>
                  <p className="text-xs font-semibold text-iscm-crimson">Responsible party: Operations &amp; Finance team (Ms. Mai / Ms. Tram).</p>
                </div>
              </div>

              {/* Flow 4 */}
              <div className="bg-white p-3 rounded-lg border border-gray-100 flex items-start gap-3">
                <span className="font-barlow-condensed text-xs font-bold bg-gray-100 text-gray-700 h-6 w-6 rounded-full flex items-center justify-center shrink-0">4</span>
                <div className="text-sm font-ibm text-iscm-charcoal space-y-1">
                  <h4 className="font-bold">Internal Payments &amp; Incentives - ISCM Fund <span className="font-normal text-gray-400">· Track 2 applicable</span></h4>
                  <div className="text-gray-500">
                    <p className="font-semibold text-gray-600">Categories:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Project development incentives for individuals who successfully connect projects/funding.</li>
                      <li>Welfare and operational support expenses funded by ISCM internal budget (not through UEH funding).</li>
                    </ul>
                  </div>
                  <p className="text-xs font-semibold text-iscm-crimson">Responsible party: Proposer in coordination with O&amp;F Head to submit internal approval workflow to the Institute Director.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Directory */}
          <div className="pt-2 space-y-3">
            <h3 className="font-barlow text-xs font-bold uppercase tracking-wider text-gray-400">Form Directory</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow text-left group">
                <span className="font-ibm text-sm font-semibold text-iscm-charcoal truncate">
                  Internal Financial Regulations
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0 border border-gray-200 px-2 py-0.5 rounded group-hover:border-iscm-crimson group-hover:text-iscm-crimson transition-colors font-ibm">
                  Download
                </span>
              </button>

              <button className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow text-left group">
                <span className="font-ibm text-sm font-semibold text-iscm-charcoal truncate">
                  Payment Document Preparation Guide
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0 border border-gray-200 px-2 py-0.5 rounded group-hover:border-iscm-crimson group-hover:text-iscm-crimson transition-colors font-ibm">
                  Download
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (section === 'placeholder-cr3') {
    return (
      <div className="w-full space-y-6 font-ibm text-sm">
        <header className="border-l-4 border-iscm-crimson pl-4 py-1 mb-6">
          <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            Internal Meeting Regulations
          </h1>
          <p className="font-ibm text-sm uppercase tracking-wider text-gray-500 mt-1">
            Quy chế làm việc, hệ thống cuộc họp và lưu trữ biên bản ISCM.
          </p>
        </header>

        <section className="glass-card p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-2">
            <h2 className="font-barlow text-xl font-bold text-iscm-charcoal border-l-2 border-iscm-crimson pl-2">
              Meeting Regulations &amp; Minutes Documentation
            </h2>
            <a 
              href="#minutes-documentation" 
              className="text-iscm-crimson hover:underline text-xs font-semibold font-ibm bg-iscm-crimson/10 px-3 py-1.5 rounded-lg"
            >
              Access Link: [Click here]
            </a>
          </div>

          {/* I. Internal Meeting System */}
          <div className="space-y-3">
            <h3 className="font-barlow text-sm font-bold text-iscm-charcoal uppercase tracking-wider">
              I. Internal Meeting System
            </h3>
            <p className="font-ibm text-sm text-gray-500">
              To ensure a continuous flow of information, ISCM’s meeting system is structured into five levels:
            </p>
            <div className="grid gap-3 mt-2 sm:grid-cols-2">
              <div className="p-3 bg-iscm-surface border border-gray-100 rounded-xl space-y-1 text-sm font-ibm">
                <span className="font-bold text-iscm-crimson">1. All-hands Meeting</span>
                <p className="text-gray-600">The Institute Director meets all ISCM members every two months.</p>
              </div>

              <div className="p-3 bg-iscm-surface border border-gray-100 rounded-xl space-y-1.5 text-sm font-ibm">
                <span className="font-bold text-iscm-crimson">2. Heads Meetings</span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600">
                  <li><strong>General Meeting:</strong> The Director meets all Functional Heads every two weeks.</li>
                  <li><strong>1-on-1 Meetings:</strong> The Director meets individually with each Functional Head every month.</li>
                </ul>
              </div>

              <div className="p-3 bg-iscm-surface border border-gray-100 rounded-xl space-y-1 text-sm font-ibm">
                <span className="font-bold text-iscm-crimson">3. Progress Review Meetings</span>
                <p className="text-gray-600">The Institute Director meets with Managers/Coordinators of Labs, Centers, Projects, and Fundraising teams every month.</p>
              </div>

              <div className="p-3 bg-iscm-surface border border-gray-100 rounded-xl space-y-1 text-sm font-ibm">
                <span className="font-bold text-iscm-crimson">4. Project/Team Execution Meetings</span>
                <p className="text-gray-600">Functional groups and project teams meet as needed, scheduled by Heads/Leads/Managers/Coordinators.</p>
              </div>

              <div className="p-3 bg-iscm-surface border border-gray-100 rounded-xl space-y-1 text-sm font-ibm sm:col-span-2">
                <span className="font-bold text-iscm-crimson">5. Youth Mentoring &amp; Orientation Meetings &amp; Ad-hoc Meetings</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                  <li><strong>Youth Meetings:</strong> The Director meets Interns, Contributors, and young professionals (under 30) every three months to listen, inspire, and support idea development.</li>
                  <li><strong>Ad-hoc Meetings:</strong> Convened at the request of the Institute Director to address urgent issues.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* II. Meeting Minutes Documentation & Archiving Regulations */}
          <div id="minutes-documentation" className="space-y-3 pt-2">
            <h3 className="font-barlow text-sm font-bold text-iscm-charcoal uppercase tracking-wider">
              II. Meeting Minutes Documentation &amp; Archiving Regulations
            </h3>
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm font-ibm">
              <p className="font-bold mb-1">Mandatory Requirement</p>
              <p>
                All meetings listed above must be documented using a standardized Meeting Minutes template and stored immediately after each meeting according to the following classification rules:
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-3 font-ibm text-sm text-iscm-charcoal">
              <div className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                <h4 className="font-bold text-iscm-crimson">Project / Event Meetings</h4>
                <p><strong>Storage:</strong> Saved directly in the corresponding project/event folder.</p>
                <p className="text-gray-500"><strong>Responsibility:</strong> Event Host or Coordinator.</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                <h4 className="font-bold text-iscm-charcoal">General Operations &amp; Functional Meetings</h4>
                <p><strong>Storage:</strong> Centralized in ISCM’s shared system, categorized into structured folders.</p>
                <p className="text-gray-500"><strong>Responsibility:</strong> Administrative Coordinators / Assigned Scribes.</p>
              </div>
            </div>
          </div>

          {/* Form Directory */}
          <div className="pt-2 space-y-3">
            <h3 className="font-barlow text-xs font-bold uppercase tracking-wider text-gray-400">Form Directory</h3>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {[
                'ISCM all members',
                'Operation & Finance',
                'Academia',
                'Research',
                'Community Engagement',
                'PR & Communication',
                'Partnership',
                'Head Meeting'
              ].map((linkName) => (
                <button 
                  key={linkName}
                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow text-left group"
                >
                  <span className="font-ibm text-xs font-semibold text-iscm-charcoal truncate group-hover:text-iscm-crimson transition-colors">
                    {linkName}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase shrink-0 border border-gray-200 px-1.5 py-0.5 rounded group-hover:border-iscm-crimson group-hover:text-iscm-crimson transition-colors">
                    Download
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return null;
}
