/*
A Component showing imprint, disclaimer, faq and privacy policy.
*/
import React, { FC, useEffect, useRef } from 'react';

import { useTranslation } from 'next-i18next';

const Disclaimer = () => {
  const { t } = useTranslation('disclaimer');

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-semibold">{t('Disclaimer')}</h1>
      <p>
        {t(
          'This is a research prototype and is not intended for production use. The developers are not responsible for any damages or losses resulting from the use of this software.',
        )}
      </p>
    </div>
  );
};

const FAQ = () => {
  const { t } = useTranslation('faq');

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-semibold">{t('FAQ')}</h1>
      <p><b>{t('What is SmartGPT?')}</b></p>
      <p>
        SmartGPT 2.0 is a community project to leverage proven prompting principles to get you smarter answers. The original SmartGPT scored an unofficial 89.0% on the MMLU and exposed hundreds of errors in the test, gaining almost a million views on social media and the attention of the top AGI labs.
      </p>
      <p>
        Asking the models multiple times, and picking the best of the outputs, is a known technique, called self-consistency, that is embedded here.
        Getting a model to ‘reflect’ and improve its own output is more of an ‘emergent ability’ seen only incipiently with the best models.
        Overcoming tokenisation (the way models don’t see whole words) is one obvious advantage. Try getting a model to output a poem that has exactly two lines ending with the name of the month, and you’ll see why you need reflection. We have consulted with the lead author of the original Reflexion paper – Noah Shinn – and been inspired by that work.
      </p>
      <p>
        Getting a different family of models, like Claude 3, to review the work of say GPT-4-Turbo, is highly experimental but works in many use cases.
        SmartGPT 2.0 will be iterated on, and if you have insights into improvements, do make your voice heard – and potentially get a channel shout-out. We are looking to 1) make it multi-modal, and include files 2) bring in automatic prompt optimisation, so you don’t have to spend time iterating to find the best prompts.
      </p>
      <p>
        This was and is a team effort, made not just through the ideas of me, Philip from AI Explained, in London but notably with the hard work of Yannick Metz, an ML PhD student in Konstanz, Germany. Inspiration was further taken from the incredible work of Joshua Stapleton, an ML engineer from South Africa, and Nicholas Schlaepfer, from UC Denver.
      </p>
      <p><b>How can I contribute ideas/improvements?</b></p>    
      <p>
        You can contribute ideas and improvements by opening an issue on the <a href="https://github.com/ymetz/smartgpt_ui">GitHub repository</a>.
      </p>
      <p><b>I sometimes get blank error messages, like a red cross?</b></p>
      <p>
        Likely you haven’t put the API keys in for both Anthropic and OpenAI. Other explanations would be a server glitch/timeout. In the second case, a page refresh should fix it.
      </p>
      <p><b>Code sometimes appears as all one block, why?</b></p>
      <p>
        This is a known issue, and we are working on a fix. Restarting the chat should fix it.
      </p>
      <p><b>Will you do another benchmark run?</b></p>
      <p>
      If we get funding, then yes. Likely not the MMLU though, as it's a bit broken, but maybe the GSM8K.
      </p>
    </div>
  );
};

const ImprintNotice = () => {
  const { t } = useTranslation('imprint');

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-semibold">{t('Imprint')}</h1>
      <p>This website is provided by <a href="https://twitter.com/metz_yannick">Yannick</a> &  <a href="https://twitter.com/AIExplainedYT">AIExplained</a></p>
    </div>
  );
};

const PrivacyPolicy = () => {
  const { t } = useTranslation('privacy-policy');

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-semibold">{t('Privacy Policy')}</h1>
      <div>
        <p>Last updated: April 10, 2024</p>
        <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
        <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy. This Privacy Policy has been created with the help of the <a href="https://www.termsfeed.com/privacy-policy-generator/" target="_blank">Privacy Policy Generator</a>.</p>
        <h2>Interpretation and Definitions</h2>
        <h3>Interpretation</h3>
        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
        <h3>Definitions</h3>
        <ul>
          <li>
            <p><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</p>
          </li>
          <li>
            <p><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>
          </li>
          <li>
            <p><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to SmartGPT.</p>
          </li>
          <li>
            <p><strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</p>
          </li>
          <li>
            <p><strong>Country</strong> refers to: Baden-Württemberg,  Germany</p>
          </li>
          <li>
            <p><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</p>
          </li>
          <li>
            <p><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</p>
          </li>
          <li>
            <p><strong>Service</strong> refers to the Website.</p>
          </li>
          <li>
            <p><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</p>
          </li>
          <li>
            <p><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</p>
          </li>
          <li>
            <p><strong>Website</strong> refers to SmartGPT, accessible from <a href="https://smartgpt-ui.vercel.app/" rel="external nofollow noopener" target="_blank">https://smartgpt-ui.vercel.app/</a></p>
          </li>
          <li>
            <p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>
          </li>
        </ul>
        <h2>Collecting and Using Your Personal Data</h2>
        <h3>Types of Data Collected</h3>
        <h4>Personal Data</h4>
        <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
        <p>Usage Data is collected automatically when using the Service.</p>
        <p>Usage Data may include information such as Your Device&apos;s Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
        <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
        <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.</p>
        <h4>Tracking Technologies and Cookies</h4>
        <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:</p>
        <ul>
          <li><strong>Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may use Cookies.</li>
          <li><strong>Web Beacons.</strong> Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).</li>
        </ul>
        <p>Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser. You can learn more about cookies on <a href="https://www.termsfeed.com/blog/cookies/#What_Are_Cookies" target="_blank">TermsFeed website</a> article.</p>
        <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
        <ul>
          <li>
            <p><strong>Necessary / Essential Cookies</strong></p>
            <p>Type: Session Cookies</p>
            <p>Administered by: Us</p>
            <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>
          </li>
          <li>
            <p><strong>Cookies Policy / Notice Acceptance Cookies</strong></p>
            <p>Type: Persistent Cookies</p>
            <p>Administered by: Us</p>
            <p>Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p>
          </li>
          <li>
            <p><strong>Functionality Cookies</strong></p>
            <p>Type: Persistent Cookies</p>
            <p>Administered by: Us</p>
            <p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter your preferences every time You use the Website.</p>
          </li>
        </ul>
        <p>For more information about the cookies we use and your choices regarding cookies, please visit our Cookies Policy or the Cookies section of our Privacy Policy.</p>
        <h3>Use of Your Personal Data</h3>
        <p>The Company may use Personal Data for the following purposes:</p>
        <ul>
          <li>
            <p><strong>To provide and maintain our Service</strong>, including to monitor the usage of our Service.</p>
          </li>
          <li>
            <p><strong>To manage Your requests:</strong> To attend and manage Your requests to Us.</p>
          </li>
          <li>
            <p><strong>For other purposes</strong>: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</p>
          </li>
        </ul>
        <p>We may share Your personal information in the following situations:</p>
        <ul>
          <li><strong>With Service Providers:</strong> We may share Your personal information with Service Providers to monitor and analyze the use of our Service,  to contact You.</li>
          <li><strong>With Your consent</strong>: We may disclose Your personal information for any other purpose with Your consent.</li>
        </ul>
        <h3>Retention of Your Personal Data</h3>
        <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.</p>
        <p>The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.</p>
        <h3>Transfer of Your Personal Data</h3>
        <p>Your information, including Personal Data, is processed at the Company&apos;s operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.</p>
        <p>Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>
        <p>The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.</p>
        <h3>Delete Your Personal Data</h3>
        <p>You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.</p>
        <p>Our Service may give You the ability to delete certain information about You from within the Service.</p>
        <p>You may update, amend, or delete Your information at any time by signing in to Your Account, if you have one, and visiting the account settings section that allows you to manage Your personal information. You may also contact Us to request access to, correct, or delete any personal information that You have provided to Us.</p>
        <p>Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.</p>
        <h3>Disclosure of Your Personal Data</h3>
        <h4>Business Transactions</h4>
        <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
        <h4>Law enforcement</h4>
        <p>Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>
        <h4>Other legal requirements</h4>
        <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
        <ul>
          <li>Comply with a legal obligation</li>
          <li>Protect and defend the rights or property of the Company</li>
          <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
          <li>Protect the personal safety of Users of the Service or the public</li>
          <li>Protect against legal liability</li>
        </ul>
        <h3>Security of Your Personal Data</h3>
        <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
        <h2>Children&apos;s Privacy</h2>
        <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.</p>
        <p>If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, We may require Your parent&apos;s consent before We collect and use that information.</p>
        <h2>Links to Other Websites</h2>
        <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party&apos;s site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
        <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>
        <h2>Changes to this Privacy Policy</h2>
        <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
        <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the &quot;Last updated&quot; date at the top of this Privacy Policy.</p>
        <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, You can contact us:</p>
        <ul>
          <li>By email: y1metz@hotmail.de</li>
        </ul>
      </div>
    </div>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export const Imprint: FC<Props> = ({ open, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      window.removeEventListener('mouseup', handleMouseUp);
      onClose();
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  if (!open) {
    return <></>;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            ref={modalRef}
            className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#212F3C] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
            <div className="flex flex-col items-center space-y-4">
              <Disclaimer />
              <FAQ />
              <ImprintNotice /> {/* Fix component name reference */}
              <PrivacyPolicy />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
