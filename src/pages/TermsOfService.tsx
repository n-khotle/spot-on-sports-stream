import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';

const TermsOfService = () => {
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('Terms & Conditions');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('title, content')
        .eq('slug', 'terms-and-conditions')
        .single();

      if (error) throw error;
      
      if (data) {
        setTitle(data.title);
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-8">{title}</h1>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                   These Terms and Conditions ("Terms") govern your access to and use of spoton.co.bw ("the Website") and the services provided by Spot On ("the Service"). By accessing or using the Service, you agree to be bound by these Terms.
                  </p>
                </div>
                <br/>
                <div style={{marginLeft: '32px'}}>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    Acceptance of Terms
                  </p>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    By creating an account, making a purchase, or otherwise using the Service, you confirm your acceptance of these Terms and any future modifications. If you do not agree to these Terms, you must not use the Service. These Terms are presented in clear and understandable language, in compliance with Botswana's Consumer Protection Act.</p>
                </div>
                <div style={{marginLeft: '32px'}}>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    Service Description
                  </p>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    Spot On provides an online streaming platform for live broadcasts of Botswana Football League matches at a specific fee. In the future, the Service may expand to include Video-on-Demand (VOD) football content or "Catch Up" on games. We commit to providing services with reasonable care and skill.</p>
                </div>

                <div style={{marginLeft: '32px'}}>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    User Accounts:
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    o Registration:
                    </p>
                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      o To access paid content, you will be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information promptly to keep it accurate, current, and complete.
                    </p>
                  </div>
                                    <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    o Account Security:
                    </p>

                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      o You are solely responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify Spot On immediately of any unauthorized use of your account. Spot On will not be liable for any loss or damage arising from your failure to comply with this security obligation.
                    </p>

                  </div>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    o Age Restriction:
                    </p>

                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      o You must be at least 18 years old to create an account and use the Service for transactional purposes. If the Service is accessed by individuals under 18 for non-transactional purposes, their personal data will be processed in accordance with the Botswana Data Protection Act 2024, which may require parental consent for certain "Information Society Services" for users under 16.
                    </p>

                  </div>
                </div>
                <div style={{marginLeft: '32px'}}>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                   Payments and Fees:
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    o Match Fees:
                    </p>
                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      o Access to live Botswana Football League matches is subject to a specific fee per match, clearly displayed on the Website.
                    </p>
                  </div>
                                    <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    o Payment Methods:
                    </p>

                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      o Payments can be made via PayPal, Visa, and designated Payment Tokens. You agree to comply with the terms and conditions of your chosen payment provider.
                    </p>

                  </div>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    o Currency:
                    </p>

                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o All fees are stated and processed in Botswana Pula (BWP) or as otherwise specified on the Website.
                    </p>

                  </div>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    o Payment Authorization:
                    </p>

                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o By providing payment information, you authorize Spot On or its third-party payment processors to charge the applicable fees to your selected payment method.
                    </p>

                  </div>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    o Transaction Review:
                    </p>

                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o Before final placement of any order, you will be given an opportunity to review the entire electronic transaction and correct any mistakes or withdraw from the transaction, in accordance with the Electronic Communications and Transactions Act.
                    </p>

                  </div>
                </div>
              <div style={{marginLeft: '32px'}}>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                Content Usage and Restrictions
                </p>

                <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                o Personal Use Only:
                </p>
                <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                The content provided through the Service is strictly for your personal, non-commercial use only. You may not reproduce, distribute, modify,display, perform, publish, license, create derivative works from, or sell any content obtained from the Service.</p>

                <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                o No Redistribution:
                </p>
                <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                You are strictly prohibited from re-streaming, rebroadcasting, sharing, or otherwise distributing any live or VOD content from Spot On without explicit prior written consent. This includes, but is not limited to, sharing your account credentials, broadcasting matches in public venues, or using screen recording software for unauthorized distribution.
                </p>
                <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                o No VPN Usage:
                </p>
                <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                You must not use a Virtual Private Network (VPN) service or similar technology to mask or otherwise hide your geographical location for the purposes of accessing content in a country or territory where it is blocked for rights reasons.
                </p>
                <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                o Device Limits:
                </p>
                <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                Spot On reserves the right to implement limits on the number of devices or concurrent streams that can be used to access your account simultaneously. Any such limits will be clearly communicated on the Website.         </p>

                 <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                o Prohibited Activities:
                </p>
                <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Service or interfere with any other party's use and enjoyment of the Service.
                </p>
              </div>
                            <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
              Intellectual Property
              </p>
                <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                All content on the Website, including text, graphics, logos, images, audio clips, video clips, and software, is the exclusive property of Spot On or its content suppliers and is protected by copyright, trademark, and other intellectual property laws. Unauthorized use of any intellectual property is strictly prohibited.
                </p>
              <div style={{marginLeft: '32px'}}>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                Data Protection and Privacy
                </p>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  Spot On is committed to protecting your personal data in accordance with the Botswana Data Protection Act 2024.                </p>
                </div>

                <div style={{marginLeft: '32px'}}>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                  o Data Collection & Use:
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o We collect and process your personal data fairly, lawfully, and transparently, only for specified, explicit, and legitimate purposes (e.g., account management, service provision, payment processing, improving user experience).
                    </p>
                  </div>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                  o Consent:
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o Where required by law, we will obtain your explicit consent for processing your personal data, particularly for purposes not strictly necessary for the provision of the Service.
                    </p>
                  </div>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                  o Security:
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o We implement appropriate technical and organizational measures to ensure the security, integrity, and confidentiality of your personal data, protecting it against unauthorized or unlawful processing and against accidental loss, destruction, or damage.</p>
                  </div>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                  o Your Rights:
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o You have rights regarding your personal data, including the right to access, rectify, or request erasure of your data, and to object to its processing, in accordance with the Data Protection Act.</p>
                  </div>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                  o Privacy Policy:
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o For comprehensive details on how we collect, use, store, and protect your personal data, please refer to our dedicated Privacy Policy, available at [Link to Privacy Policy Page].</p>
                  </div>
                </div>
                <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                  Disclaimers
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. Spot On does not guarantee that the Service will be uninterrupted, error-free, or free from viruses or other harmful components. We make no guarantees regarding the quality of your viewing experience, which may be affected by factors beyond our control, including your internet connection speed, device capabilities, network congestion, or geographical location.</p>
                  </div>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                  Limitation of Liability
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    To the fullest extent permitted by applicable law, Spot On shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Service; (b) any conduct or content of any third party on the Service; or (c) unauthorized access, use, or alteration of your transmissions or content.
                    </p>
                  </div>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                  Changes to Terms
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    Spot On reserves the right to modify these Terms at any time. Any changes will be effective immediately upon posting the revised Terms on the Website. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
                    </p>
                  </div>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                  Governing Law
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    These Terms shall be governed by and construed in accordance with the laws of Botswana, without regard to its conflict of law principles.
                    </p>
                  </div>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                  Contact Information
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    For any questions regarding these Terms, please contact us at Support Email.
                    </p>
                  </div>
                </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;