"""Train and compare the browser digit model using held-out MNIST samples."""
import json, sys
import numpy as np
from PIL import Image
from scipy.ndimage import minimum_filter, maximum_filter, rotate, affine_transform
from sklearn.neural_network import MLPClassifier
rng = np.random.default_rng(73)
z = np.load(sys.argv[1])
def prep(im):
    yy, xx = np.where(im > 30)
    if not len(xx): return np.zeros(400, dtype=np.float32)
    crop = im[yy.min():yy.max()+1, xx.min():xx.max()+1]
    h, w = crop.shape; scale = 16 / max(h, w)
    a = np.array(Image.fromarray(crop.astype(np.uint8)).resize((max(1,round(w*scale)), max(1,round(h*scale))), Image.Resampling.BILINEAR),dtype=np.float32)/255
    out = np.zeros((20,20),dtype=np.float32); h,w = a.shape
    out[(20-h)//2:(20-h)//2+h,(20-w)//2:(20-w)//2+w] = a
    return out.ravel()
def augment(im, mode, angle=0):
    if mode == 0: return minimum_filter(im,size=2)
    if mode == 1: return rotate(im,angle,reshape=False,order=1)
    if mode == 2:
        shear=angle/50
        return affine_transform(im,[[1,0],[shear,1]],offset=[0,-shear*14],order=1)
    if mode == 3: return np.where(im>100,255,0).astype(np.uint8)
    return maximum_filter(im,size=2)
print('Preparing clean and varied stroke samples',flush=True)
x=[];y=[]
for im,label in zip(z['x_train'],z['y_train']):
    x.append(prep(im));y.append(label)
    x.append(prep(augment(im,int(rng.integers(5)),float(rng.uniform(-12,12)))));y.append(label)
x=np.array(x);y=np.array(y)
m=MLPClassifier(hidden_layer_sizes=(256,128),max_iter=25,batch_size=256,learning_rate_init=.001,random_state=73,early_stopping=True,n_iter_no_change=4,verbose=True).fit(x,y)
old=json.load(open(sys.argv[3]))
def old_predict(x):
    a=x
    for i,(w,b) in enumerate(zip(old['weights'],old['biases'])):
        a=a@np.array(w,dtype=np.float32)+np.array(b,dtype=np.float32)
        if i<len(old['weights'])-1:a=np.maximum(a,0)
    return a.argmax(axis=1)
metrics={}
for name,mode,angle in [('clean',None,0),('thin',0,0),('slanted',2,10),('rotated',1,-10),('solid strokes',3,0)]:
    test=np.array([prep(im if mode is None else augment(im,mode,angle)) for im in z['x_test']])
    metrics[name]={'old':float(np.mean(old_predict(test)==z['y_test'])),'new':float(m.score(test,z['y_test']))}
    print(name,metrics[name],flush=True)
obj={'size':20,'weights':[np.round(v,6).tolist() for v in m.coefs_],'biases':[np.round(v,6).tolist() for v in m.intercepts_],'validation':metrics}
open(sys.argv[2],'w').write(json.dumps(obj,separators=(',',':')))
