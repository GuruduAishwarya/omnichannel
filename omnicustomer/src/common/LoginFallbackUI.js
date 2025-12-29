import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoginFallbackUI = () => {

  return (
    <div>
      <div className="ls-bg">
        {/* <img className="ls-bg-inner" src="assets/images/login-page3.png" alt="" />   */}
        {/* <Skeleton height={40} width={400} /> */}

      </div>
      <main className="overflow-hidden">
        <div className="wrapper">
          <div className="main-inner">
            {/* logo */}
            <div className="logo">
              <div className="logo-icon">
                <Skeleton width={100} height={40} />
              </div>
            </div>
            <div className="row h-100 align-content-center">
              <div className="col-md-6 tab-100 order_2">
                {/* side text */}
                <div className="side-text">
                  <article>
                    <Skeleton count={3} />
                  </article>
                </div>
              </div>
              <div className="col-md-6 tab-100">
                {/* form */}
                <div className="form">
                  <Skeleton count={6} height={40} width={400} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginFallbackUI;
